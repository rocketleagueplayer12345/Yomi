'use strict';

// Hanime.red HTML adapter. The site exposes tag archives at /tag/{slug}?page=N.
// Keep this adapter intentionally small: bounded HTML responses, bounded LRU cache,
// short timeouts, and no full-site crawl (important for Render's 512 MB RAM tier).
const axios = require('axios');
const { SAFE_HANIMERED_TAGS, getCanonicalHanimeRedTag, tagToSlug } = require('./hanimered-tags');

const BASE_URL = 'https://hanime.red';
const REQUEST_TIMEOUT_MS = 6500;
const MAX_HTML_BYTES = 1024 * 1024;
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 48;
const CACHE_MAX_METAS = 60;
const cache = new Map();

function cacheGet(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.time > CACHE_TTL_MS) { cache.delete(key); return null; }
    cache.delete(key); cache.set(key, entry);
    return entry.value;
}
function cacheSet(key, value) {
    if (cache.has(key)) cache.delete(key);
    while (cache.size >= CACHE_MAX_ENTRIES) cache.delete(cache.keys().next().value);
    cache.set(key, { time: Date.now(), value });
    return value;
}
function decodeHtml(value) {
    return String(value || '')
        .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#039;/g, "'")
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}
function stripHtml(value) {
    return decodeHtml(String(value || '').replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
        .replace(/\s+/g, ' ').trim();
}
function normalizeTitle(value) {
    return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/\b(?:episode|ep)\s*[-:#]?\s*\d+(?:\s*of\s*\d+)?\b/gi, ' ')
        .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function titleFromSlug(slug) {
    let title = decodeURIComponent(String(slug || '')).replace(/-/g, ' ');
    title = title.replace(/\s+(?:episode|ep)\s*\d+(?:\s+of\s+\d+)?\s*$/i, '');
    return title.replace(/\s+/g, ' ').trim();
}
function parseEpisodeLinks(html) {
    const found = new Map();
    // Episode pages use root-level slug URLs. Ignore navigation, /tag/, /serie/,
    // /studio/, and other site routes. Keep only unique episode slugs.
    const anchorRe = /<a\b([^>]*href=["'](?:https?:\/\/hanime\.red)?\/([a-z0-9][a-z0-9-]{2,})["'][^>]*)>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = anchorRe.exec(html))) {
        const slug = match[2];
if (/^(?:tag|tags|serie|series|studio|studios|brand|brands|browse|search|login|register|account|privacy|terms|dmca|random|history|favorites)$/i.test(slug)) continue;
        const inner = match[3];
        const rawText = stripHtml(inner);
        const title = titleFromSlug(slug);
        if (!title || title.length < 3) continue;
        const img = inner.match(/<(?:img|source)\b[^>]*(?:src|data-src|data-lazy-src)=["']([^"']+)["']/i);
        const image = img ? decodeHtml(img[1]) : null;
        if (!found.has(slug)) found.set(slug, { slug, title, rawText, image });
    }
    return Array.from(found.values()).slice(0, CACHE_MAX_METAS);
}
function groupEpisodesAsSeries(episodes, tag) {
    const grouped = new Map();
    for (const episode of episodes) {
        const title = episode.title;
        const key = normalizeTitle(title);
        if (!key) continue;
        let item = grouped.get(key);
        if (!item) {
            item = { title, titleSlug: episode.slug, poster: episode.image || null, tags: [tag] };
            grouped.set(key, item);
        } else if (!item.poster && episode.image) item.poster = episode.image;
    }
    return Array.from(grouped.values()).slice(0, CACHE_MAX_METAS);
}
async function fetchHtml(url) {
    const response = await axios.get(url, {
        timeout: REQUEST_TIMEOUT_MS,
        maxContentLength: MAX_HTML_BYTES,
        maxBodyLength: MAX_HTML_BYTES,
        responseType: 'text',
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; YomiStremioAddon/1.0)',
            'Accept': 'text/html,application/xhtml+xml',
            'Referer': `${BASE_URL}/tags`
        }
    });
    if (typeof response.data !== 'string') throw new Error('Hanime.red returned a non-HTML response');
    return response.data;
}
async function browseHanimeRedByTag(tag, sort = 'Most Recent', page = 1) {
    const canonical = getCanonicalHanimeRedTag(tag);
    const slug = canonical && tagToSlug(canonical);

    console.log('[YOMI HANIMERED INPUT DEBUG]', {
        receivedTag: tag,
        canonicalTag: canonical,
        slug: slug
    });

    if (!slug) {
        console.error('[YOMI HANIMERED INVALID TAG]', {
            receivedTag: tag,
            canonicalTag: canonical
        });
        return [];
    }

    const safePage = Math.max(1, Math.min(100, Number.parseInt(page, 10) || 1));
    const key = `tag:${slug}:${safePage}`;
    const cached = cacheGet(key);

    console.log('[YOMI HANIMERED CACHE CHECK]', {
        tag: canonical,
        cacheHit: cached !== null && cached !== undefined,
        cachedResults: cached ? cached.length : 0
    });

    if (cached) return cached;
    try {
        const url = `${BASE_URL}/tag/${encodeURIComponent(slug)}?page=${safePage}`;
        const html = await fetchHtml(url);
        const episodes = parseEpisodeLinks(html);
        const series = groupEpisodesAsSeries(episodes, canonical);
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

        console.log('[YOMI HANIMERED TAG DEBUG]', {
            tag: canonical,
            url,
            htmlLength: html.length,
            pageTitle: titleMatch ? stripHtml(titleMatch[1]) : '(no title)',
            anchorCount: (html.match(/<a\b/gi) || []).length,
            matchedEpisodeLinks: episodes.length,
            seriesCount: series.length,
            looksBlocked: /cloudflare|just a moment|access denied|captcha/i.test(html)
        });

        return cacheSet(key, series);
    } catch (error) {
        console.error('[YOMI HANIMERED TAG ERROR]', {
            tag: canonical,
            page: safePage,
            status: error.response?.status,
            message: error.message
        });
        return [];
    }
}

function safeTags(tags) {
    if (!Array.isArray(tags)) return [];
    const out = [];
    const seen = new Set();
    for (const value of tags) {
        const canonical = getCanonicalHanimeRedTag(value);
        if (!canonical || seen.has(canonical.toLowerCase())) continue;
        seen.add(canonical.toLowerCase()); out.push(canonical);
    }
    return out;
}
function filterSeriesByTag(series, tag) {
    const canonical = getCanonicalHanimeRedTag(tag);
    if (!canonical) return [];
    return (series || []).filter(item => safeTags(item.tags).some(value => value.toLowerCase() === canonical.toLowerCase()));
}

function makeHanimeRedMeta(series, encodeId) {
    const title = series.title || series.titleSlug || 'Unknown';

    const poster = series.poster
        ? (series.poster.startsWith('http')
            ? series.poster
            : `${BASE_URL}${series.poster.startsWith('/') ? '' : '/'}${series.poster}`)
        : undefined;

    return {
        id: `sukebei:${encodeId(title)}`,
        type: 'anime',
        name: title,
        poster,
        genres: safeTags(series.tags),
        hanimeRedSlug: series.titleSlug
    };
}

function findExactSeriesMatch(title, seriesList) {
    const target = normalizeTitle(title);
    if (!target) return null;
    return (seriesList || []).find(item => normalizeTitle(item.title) === target) || null;
}

module.exports = {
    SAFE_HANIMERED_TAGS,
    browseHanimeRedByTag,
    findExactSeriesMatch,
    makeHanimeRedMeta,
    filterSeriesByTag,
    safeTags
};
