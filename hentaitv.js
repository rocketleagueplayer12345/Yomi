'use strict';

// Hentai.tv metadata adapter. It stores only compact, reduced series records;
// it never caches raw HTML or full API responses (important for Render's 512 MB tier).
const axios = require('axios');
const { SAFE_HENTAITV_TAGS, getCanonicalHentaiTVTag } = require('./hentaitv-tags');

const HENTAITV_BASE = 'https://hentai.tv';
const HENTAITV_TIMEOUT_MS = 4500;
const HENTAITV_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const HENTAITV_CACHE_MAX_ENTRIES = 48;
const HENTAITV_CACHE_MAX_SERIES_PER_ENTRY = 60;
const cache = new Map();

function getCache(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > HENTAITV_CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    cache.delete(key);
    cache.set(key, entry);
    return entry.value;
}

function setCache(key, value) {
    if (cache.has(key)) cache.delete(key);
    while (cache.size >= HENTAITV_CACHE_MAX_ENTRIES) {
        cache.delete(cache.keys().next().value);
    }
    cache.set(key, { timestamp: Date.now(), value });
    return value;
}

function normalizeTitle(value) {
    return String(value || '')
        .replace(/\s*[·•-]\s*(?:EP|EPISODE)\s*\d+(?:\s*\/\s*\d+)?\s*$/i, '')
        .replace(/\s+(?:EP|EPISODE)\s*\d+(?:\s*\/\s*\d+)?\s*$/i, '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
}

function normalizeSlug(value) {
    return normalizeTitle(String(value || '').replace(/-/g, ' '));
}

function safeTags(tags) {
    if (!Array.isArray(tags)) return [];
    const result = [];
    const seen = new Set();
    for (const raw of tags) {
        const canonical = getCanonicalHentaiTVTag(raw);
        if (!canonical) continue;
        const key = canonical.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            result.push(canonical);
        }
    }
    return result;
}

// Hentai.tv's /api/search and /api/browse return episode records. Group by
// titleSlug so a series gets the union of its verified episode tags.
function groupVideosIntoSeries(videos) {
    const grouped = new Map();
    for (const video of Array.isArray(videos) ? videos : []) {
        if (!video || typeof video !== 'object') continue;
        const slug = String(video.titleSlug || '').trim();
        if (!slug) continue;
        let item = grouped.get(slug);
        if (!item) {
            item = {
                title: String(video.title || slug.replace(/-/g, ' ')).trim().slice(0, 200),
                titleSlug: slug,
                poster: video.cover || video.thumb || video.featureImage || null,
                background: video.backdrop || video.featureImage || video.cover || null,
                description: typeof video.description === 'string' ? video.description.slice(0, 1200) : '',
                year: Number.isFinite(Number(video.year)) ? Number(video.year) : null,
                tags: [],
                _tagSet: new Set()
            };
            grouped.set(slug, item);
        }
        for (const tag of safeTags(video.tags)) {
            const key = tag.toLowerCase();
            if (!item._tagSet.has(key)) {
                item._tagSet.add(key);
                item.tags.push(tag);
            }
        }
        if (!item.poster) item.poster = video.cover || video.thumb || video.featureImage || null;
        if (!item.background) item.background = video.backdrop || video.featureImage || null;
        if (!item.description && typeof video.description === 'string') item.description = video.description.slice(0, 1200);
        if (!item.year && Number.isFinite(Number(video.year))) item.year = Number(video.year);
    }
    return Array.from(grouped.values()).slice(0, HENTAITV_CACHE_MAX_SERIES_PER_ENTRY).map(item => {
        delete item._tagSet;
        return item;
    });
}

async function requestVideoList(path, params) {
    const response = await axios.get(`${HENTAITV_BASE}${path}`, {
        params,
        timeout: HENTAITV_TIMEOUT_MS,
        maxContentLength: 1024 * 1024,
        maxBodyLength: 1024 * 1024,
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; YomiStremioAddon/1.0)',
            'Accept': 'application/json, text/plain, */*',
            'Referer': `${HENTAITV_BASE}/`
        }
    });
    return Array.isArray(response.data?.videos) ? response.data.videos : [];
}

async function searchHentaiTVSeries(query) {
    const clean = String(query || '').trim();
    if (clean.length < 2) return [];
    const key = `search:${clean.toLowerCase()}`;
    const cached = getCache(key);
    if (cached) return cached;

    const promise = (async () => {
        try {
            const videos = await requestVideoList('/api/search', { q: clean, limit: 100 });
            return setCache(key, groupVideosIntoSeries(videos));
        } catch (error) {
            // A failed lookup is deliberately not cached, allowing the next request to retry.
            return [];
        }
    })();
    setCache(key, promise);
    const result = await promise;
    if (result.length === 0) cache.delete(key);
    return result;
}

async function browseHentaiTVByTag(tag, sort = 'Most Recent', page = 1) {
    const canonicalTag = getCanonicalHentaiTVTag(tag);
    if (!canonicalTag) return [];
    const safePage = Math.max(1, Math.min(100, Number.parseInt(page, 10) || 1));
    const key = `browse:${canonicalTag.toLowerCase()}:${sort}:${safePage}`;
    const cached = getCache(key);
    if (cached) return cached;

    const promise = (async () => {
        try {
            const videos = await requestVideoList('/api/browse', {
                genres: canonicalTag,
                sort,
                page: safePage
            });
            return setCache(key, groupVideosIntoSeries(videos));
        } catch (error) {
            return [];
        }
    })();
    setCache(key, promise);
    const result = await promise;
    if (result.length === 0) cache.delete(key);
    return result;
}

function findExactSeriesMatch(title, seriesList) {
    const target = normalizeTitle(title);
    const targetSlug = normalizeSlug(title);
    if (!target) return null;
    for (const series of seriesList || []) {
        if (normalizeTitle(series.title) === target || normalizeSlug(series.titleSlug) === targetSlug) {
            return series;
        }
    }
    return null;
}

function makeHentaiTVMeta(series, encodeId) {
    const title = series.title || series.titleSlug || 'Unknown';
    return {
        id: `sukebei:${encodeId(title)}`,
        type: 'anime',
        name: title,
        poster: series.poster || undefined,
        background: series.background || undefined,
        description: series.description || undefined,
        releaseInfo: series.year ? String(series.year) : undefined,
        genres: safeTags(series.tags),
        hentaiTvSlug: series.titleSlug
    };
}

function filterSeriesByTag(seriesList, tag) {
    const canonical = getCanonicalHentaiTVTag(tag);
    if (!canonical) return [];
    const target = canonical.toLowerCase();
    return (seriesList || []).filter(series => safeTags(series.tags).some(item => item.toLowerCase() === target));
}

module.exports = {
    SAFE_HENTAITV_TAGS,
    searchHentaiTVSeries,
    browseHentaiTVByTag,
    findExactSeriesMatch,
    makeHentaiTVMeta,
    filterSeriesByTag,
    safeTags
};
