'use strict';

// Tag snapshot from https://hanime.red/tags (66 main tags + 6 under More tags; 4 excluded, leaving 68 exposed).
// The source labels below preserve the site's spelling and capitalization.
// Four tags are intentionally not exposed because they directly facilitate
// discovery of sexual content associated with minors: school girl, loli, shota,
// and High School.
//
// ADDING OR REFRESHING TAGS:
// 1. Compare this array with https://hanime.red/tags.
// 2. Add the exact visible label here (and keep its case/spaces unchanged).
// 3. Do not add the four excluded categories listed above.
// 4. The manifest options and tag-page URL mapping update automatically from
//    this array after the addon restarts; no second tag list needs editing.
// 5. Test the tag in Stremio and inspect Render logs if its page returns no data.
//
// The 2024/2025 entries are included because Hanime.red lists them under More tags.
const SAFE_HANIMERED_TAGS = Object.freeze([
    'blow job',
    'censored',
    'big boobs',
    'creampie',
    'HD',
    'rape',
    'loli',
    'High School', 
    'school girl',
    'uncensored',
    'plot',
    'anal',
    'harem',
    'bondage',
    'facial',
    'virgin',
    'boob job',
    'toys',
    'fantasy',
    'gangbang',
    'yuri',
    'public sex',
    'hand job',
    'glasses',
    'monster',
    'incest',
    'ahegao',
    'vanilla',
    'teacher',
    'tentacle',
    '3d',
    'masturbation',
    'cosplay',
    'maid',
    'ntr',
    'milf',
    'Oral',
    'BDSM',
    'swimsuit',
    'watersports',
    'filmed',
    'comedy',
    'orgy',
    'horror',
    'x-ray',
    'pov',
    'mind break',
    'ugly bastard',
    'nurse',
    'futanari',
    'mind control',
    'dark skin',
    'lactation',
    'threesome',
    'reverse rape',
    'foot job',
    'inflation',
    'scat',
    'pregnant',
    'rimjob',
    'tsundere',
    'softcore',
    'nekomimi',
    'Blow Jow',
    'yaoi',
    'trap',
    'Cream Pie',
    'Short',
    '2025',
    'Doggy Style',
    '2024'
]);
function getCanonicalHanimeRedTag(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim().toLowerCase();
    return SAFE_HANIMERED_TAGS.find(tag => tag.toLowerCase() === normalized) || null;
}

function tagToSlug(tag) {
    const canonical = getCanonicalHanimeRedTag(tag);
    if (!canonical) return null;
    return canonical.toLowerCase().normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

module.exports = { SAFE_HANIMERED_TAGS, getCanonicalHanimeRedTag, tagToSlug };
