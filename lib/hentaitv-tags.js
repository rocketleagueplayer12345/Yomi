'use strict';

// Hentai.tv taxonomy snapshot, verified against https://hentai.tv/genres.
// The source currently advertises 110 categories. This allowlist intentionally
// omits categories whose descriptions promote sexual content involving minors.
// Keep the remaining source labels EXACTLY as Hentai.tv spells/capitalizes them.
//
// ADDING A TAG LATER:
// 1. Verify that the tag exists on https://hentai.tv/genres.
// 2. Add its exact display/API spelling to SAFE_HENTAITV_TAGS below.
// 3. Confirm it is not a category for sexual content involving minors.
// 4. Restart Yomi so addon.js rebuilds the Stremio manifest options.
// 5. Test both the catalog filter and Hentai.tv metadata matching.
// Do not add aliases or normalized spellings here; normalization is handled
// separately in lib/hentaitv.js and is used only for matching, not display.

const SAFE_HENTAITV_TAGS = Object.freeze([
    'Vanilla', 'anal', 'Romance', 'Big Boobs', 'Maid', 'Comedy', 'loli', 'teacher', 'schoolgirl', 'Loli', 'high school', 'shota', 
    'incest', 'Glasses', 'Swimsuit', 'Uncensored', 'virgin', 'bondage',
    'Censored', 'Blow Job', 'Oral', 'Creampie', 'fantasy', 'Masturbation',
    'Ahegao', 'harem', 'Threesome', 'milf', 'Cosplay', 'ntr', 'Tsundere',
    'nurse', 'tentacle', 'monster', 'orgy', 'boob job', 'toys', 'rape',
    'Short', 'yaoi', 'plot', 'mind control', 'facial', 'pregnant',
    'hand job', 'HD Anime', 'lactation', 'rimjob', 'x-ray', 'Doggy Style',
    'foot job', 'yuri', 'gangbang', 'filmed', 'horror', 'public sex',
    'ugly bastard', 'reverse rape', 'watersports', 'nekomimi', 'dark skin',
    'BDSM', 'inflation', 'mind break', 'futanari', 'pov', 'Nudity',
    'Blowjob', 'Exhibitionism', 'Big Breasts', 'Paizuri', 'Hentai',
    'Voyeurism', 'Corruption', 'Magic', 'Huge Breasts', 'Cheating',
    'Big Tits', 'First Kiss', 'Drama', 'office lady', 'Sex Toys',
    'Group Sex', 'FFM Threesome', 'Humiliation', 'scat', 'Impregnation',
    'Housewife', 'Elf', 'Gyaru', 'Erotic Game', 'softcore', 'Teasing',
    '3d', 'Cream Pie', 'Sex', 'Small tits', 'trap', 'Tentacles', 'Public',
    'Femdom', 'monster girl', 'Blackmail', 'Netorare', 'Fellatio',
    'LARGE BREASTS', 'Titjob'
]);

const SAFE_HENTAITV_TAG_SET = new Set(SAFE_HENTAITV_TAGS.map(tag => tag.toLowerCase()));

function isSafeHentaiTVTag(tag) {
    return typeof tag === 'string' && SAFE_HENTAITV_TAG_SET.has(tag.trim().toLowerCase());
}

function getCanonicalHentaiTVTag(tag) {
    if (!isSafeHentaiTVTag(tag)) return null;
    const lower = tag.trim().toLowerCase();
    return SAFE_HENTAITV_TAGS.find(item => item.toLowerCase() === lower) || null;
}

module.exports = { SAFE_HENTAITV_TAGS, isSafeHentaiTVTag, getCanonicalHentaiTVTag };
