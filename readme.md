<p align="center">
  <img src="https://raw.githubusercontent.com/mralanbourne/Yomi/main/static/yomi_large.png" width="300" alt="Yomi Logo">
</p>

<h1 align="center">YOMI: Your Forbidden Gateway</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-9.3.5-e91e63.svg?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Stremio-Addon-8a5a9e?style=for-the-badge&logo=stremio" alt="Stremio Addon">
  <img src="https://img.shields.io/badge/Status-Online-success?style=for-the-badge" alt="Status Online">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License MIT">
  <img src="https://img.shields.io/badge/Infrastructure-VPS_Ready-2496ED?style=for-the-badge&logo=docker" alt="VPS Ready">
  <img src="https://img.shields.io/badge/P2P-Supported-green?style=for-the-badge&logo=bittorrent" alt="P2P Supported">
</p>

<p align="center">
  <strong>The definitive high-performance bridge between Sukebei and Stremio. Access the largest library of uncensored adult anime & Hentai via Real-Debrid, Torbox, or Direct P2P BitTorrent with advanced episode parsing, a strict 3-phase sorting engine, subtitle injection, and zero server-side tracking.</strong><br />
  <strong>🍏 Fully Compatible with Stremio Web (Linux / iOS / iPadOS) & AIOStreams 🖤</strong>
</p>

<div align="center">
  <h3>🌐 Community Instance</h3>
  <a href="https://yomi.ruka.pw">yomi.ruka.pw</a>
  <br />
  <br />
  <a href="https://yomi.ruka.pw">
    <img src="https://img.shields.io/badge/INSTALL_NOW-CLICK_HERE-e91e63?style=for-the-badge&logo=rocket" alt="Install Button" height="55">
  </a>
</div>

<br />

> [!WARNING]
> ### ⚠️ MUST READ: Addon Quirks & Limitations
> Sukebei is the Wild West of anime releases. Yomi uses no backend database to store results, resolving everything on-the-fly. Keep these UI quirks in mind:
> 
> 1. 🖼️ **The "Pink Posters" (Working as intended):** During a global search, obscure Sukebei results will appear as pink text-only posters to keep the search lightning fast. **This is not a bug!** The real MyAnimeList poster, description, and episode count are fetched in the background *the moment you click on the title*.
> 2. 🎭 **Mismatched Metadata:** Because the addon tries to match incredibly messy Sukebei titles against strict databases like AniList or MAL, it will sometimes guess wrong and display the wrong poster. **Don't panic!** The actual video streams are fetched directly from Sukebei based on the raw title, so the streams inside will still be correct.
> 3. 👻 **Inflated Episode Counts:** If metadata APIs don't know how many episodes a series has, Yomi scans the torrent titles to guess the highest episode number. If an uploader mislabeled a file (e.g., naming it Episode 12 instead of 02), Stremio might show 12 episode tiles. Just ignore the empty "ghost" episodes.
> 4. 🎬 **The "Loading" Video (Uncached Torrents):** If you click an uncached stream (`☁️ Download`), Stremio will start playing a looping "Waiting/Loading" video. **This is not an error!** It means Yomi sent the Torrent to your Debrid cloud. Wait a bit, back out of the episode screen, and click it again to refresh the live download progress (e.g., `[⏳ 45% RD]`).
> 5. 🔍 **Search Term Strictness:** Because we search the Sukebei RSS feed directly, your search queries need to be somewhat accurate. Stick to Romaji or English titles or phrases. Very short abbreviations (under 4 characters) or obscure Kanji searches might yield empty catalogs.

> [!IMPORTANT]
> ### 🔒 Privacy & Zero-Knowledge Security
> * Yomi is built on a **Stateless Architecture**. Unlike other addons, your sensitive data never touches a database.
> * **Base64 Config:** Your Debrid keys and Language preferences are stored exclusively in your personal Manifest URL using secure Base64 encoding.
> * **Direct Resolution:** Stream links are resolved on-the-fly and redirected directly to your player.
> * **P2P Warning:** If you enable the "Simple P2P" feature, you bypass Debrid services and stream via standard BitTorrent. Your IP address will be visible to the swarm. **A VPN is highly recommended!**
> * **100% Open Source:** Your security is paramount. Verify the code yourself. Everything is public.

### 🌙 Quick Start
1. Open the [Community Instance](https://yomi.ruka.pw).
2. Enter your Real-Debrid and / or Torbox API Key, **OR** toggle the **"Enable Simple P2P"** option if you do not have a Debrid subscription.
3. Select your **Preferred Languages** (e.g., GER, JPN, ENG) from the setup grid. Order matters!
4. Choose your catalog preferences (Trending / Top Rated).
5. Click "Install" or copy your manifest url to add your personalized configuration to Stremio.
6. Use the global Stremio search. Results will appear under the **"Yomi Search"** catalog.

### ✨ Key Features & Next-Gen Engine Upgrades
* **📡 Simple P2P & Tracker Injection:** Don't have a Debrid service? Yomi can seamlessly hand over pure `infoHash` objects injected with high-availability trackers directly to Stremio's internal WebTorrent engine for blazing-fast peer discovery.
* **🍏 Apple iOS & Flatpak Ready:** Yomi features a heavily hardened CORS and Preflight (`OPTIONS`) architecture, guaranteeing seamless stream and subtitle loading on strict WebKit browsers (iPhone/iPad Safari) and Linux sandboxes.
* **🔄 Automated Tracker Failover & Proxy:** Sukebei trackers are often targeted by ISP blocks. Yomi now features an intelligent mirror-rotation engine (nyaa.si, iss.one, etc.) with optional Proxy tunneling to bypass aggressive Cloudflare challenges and DNS bans.
* **🧠 3-Phase Multi-Pass Sorter:** The stream sorting engine guarantees absolute precision. Streams are strictly cascaded by: **1. Language Priority & Cache Status ➔ 2. Video Resolution (8K down to SD) ➔ 3. File Size**. 
* **🚀 Smart Movie & OVA Bypass:** No more false-negative drops! Yomi's adaptive parser perfectly differentiates between single-file movies/OVAs and multi-episode series.
* **📦 Bulletproof Batch Routing (Binge-Ready):** Uploaders on Sukebei use zero naming conventions. Yomi intelligently recognizes international batch formats (like Spanish `01 a 12`) and isolates exact individual files inside massive batch folders. Clicking "Next Episode" in Stremio seamlessly loads the correct file.
* **⛩️ Aggressive Unicode Sanitization:** Advanced reverse-digit extraction safely captures Japanese volume markers (第, 巻), single-character tags (E05), and strictly protects Hentai versioning tags (like `v2` or `v3` for decensored re-releases) or audio channels (`5.1`) from being misidentified as episode numbers.
* **🛡️ Precision Subtitle Proxy:** No more false positives! Yomi utilizes strict ISO boundaries to differentiate between European words (like "de" or "es") and actual release tags. External `.ass`, `.srt`, `.vtt`, and `.ssa` files are automatically scrubbed, proxied with bandwidth-leak protection, and injected into the Stremio player.
* **🧠 Dual-Database Intelligence (AniList + MAL):** Yomi scrapes AniList for high-quality metadata. If an obscure adult release is missing, it automatically falls back to **MyAnimeList (Jikan API)** to fetch official posters, synopsis, and true episode counts.

---

<details>
<summary>💻 <strong>Self-Hosting Instructions (VPS & Docker)</strong></summary>

### Hosting your own Gateway
Yomi is optimized for dedicated VPS hosting using Docker. It requires no persistent storage or database.

#### 1. Deployment (Docker Compose)
The recommended way to host Yomi is via `docker-compose`. This ensures easy updates and log management.

```yaml
services:
  yomi-scraper:
    image: ghcr.io/mralanbourne/yomi:latest
    container_name: stremio-yomi
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=7000
      - BASE_URL=[https://yomi.ruka.pw](https://yomi.ruka.pw)
      - ROOT_TORBOX_KEY=your_torbox_api_key
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```
</details>


## Hentai.tv genre filters and adding tags

Yomi's supported genre filter names are based on the categories listed by Hentai.tv at <https://hentai.tv/genres>. The integration reads Hentai.tv's `/api/search` and `/api/browse` endpoints for title tags and genre-filtered catalog results. A title receives tags only when Yomi can match it to a Hentai.tv series by an exact normalized title or series slug; unmatched titles are left untagged rather than guessed.

### Where to edit tags later

1. **`lib/hentaitv-tags.js` — master tag list.** Add a verified Hentai.tv category using the exact spelling and capitalization shown on the source site. This is the only place to add a display/filter tag. The list intentionally excludes categories that promote sexual content involving minors.
2. **`lib/hentaitv-tags.js` — safety/canonicalization helpers.** `isSafeHentaiTVTag()` and `getCanonicalHentaiTVTag()` decide whether a returned API tag is allowed and map it back to the exact display spelling. Do not add aliases here; add the source's exact tag to the master list instead.
3. **`lib/hentaitv.js` — metadata tag normalization.** `safeTags()` filters API tags against the master list. `groupVideosIntoSeries()` unions episode tags into a series. `findExactSeriesMatch()` controls how Hentai.tv results are matched to Yomi titles. Edit this matching logic only if Hentai.tv changes its response format or title conventions.
4. **`addon.js` — Stremio catalog options.** The `manifest.catalogs` entries use `SAFE_HENTAITV_TAGS` for the `genre` option. The same array is shared across all active Yomi catalogs, so a new permitted tag appears in every catalog after restart.
5. **`addon.js` — catalog filtering.** The `defineCatalogHandler` block reads `extra.genre`. The latest/trending/top catalogs use Hentai.tv's genre browse endpoint; Yomi Search uses Hentai.tv search results and keeps exact matches.
6. **`addon.js` — detail metadata enrichment.** The meta handler looks up Hentai.tv tags when an item is opened. This is optional and cached; a failed lookup does not block metadata or streams.
7. **`lib/hentaitv.js` — memory/network limits.** `HENTAITV_CACHE_TTL_MS`, `HENTAITV_CACHE_MAX_ENTRIES`, `HENTAITV_CACHE_MAX_SERIES_PER_ENTRY`, `HENTAITV_TIMEOUT_MS`, and the 1 MB response limit control the new integration's footprint. Keep these bounded for Render's 512 MB RAM free tier.
8. **`lib/anilist.js` — shared AniList/Jikan cache.** `CACHE_TTL` and `MAX_CACHE_ENTRIES` control the existing metadata cache. Increase these only after measuring actual Render memory usage.

### Adding a new permitted Hentai.tv tag

- Verify the exact category on Hentai.tv's category page.
- Add the exact source spelling to `SAFE_HENTAITV_TAGS` in `lib/hentaitv-tags.js`.
- Restart/redeploy Yomi. The manifest options are generated from this shared list at process startup.
- Test the tag on Latest, Trending, Top Rated, and Search. Check that results are returned only when Hentai.tv supplies that tag.
- Do not add tags for sexualized depictions of minors or create alternate spellings that do not exist on Hentai.tv.

