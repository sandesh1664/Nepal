> **Media transfer in progress.** Source code is available now. Run the restore command after `UPLOAD-STATUS.json` reports complete.

# Nepal — Beyond the Ordinary

A cinematic Nepal travel website covering all seven provinces, 77 district introductions and 109 destination guides. Built with editable HTML, CSS and JavaScript, with locally bundled images, videos and Three.js.

## Run locally

Clone this repository, then start a local server with Python 3:

```bash
git clone https://github.com/sandesh1664/Nepal.git
cd Nepal
python3 restore_assets.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open **http://localhost:8000**. Press **Ctrl+C** to stop the server.

On Windows, use `py -3` in place of `python3` if needed. No npm installation, build command, API key or database is required. Serve the site over HTTP instead of opening HTML files directly so the immersive JavaScript modules can load correctly.

## Explore the website

- National homepage with destination filters, saved places, seasons and a journey planner.
- Dedicated Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali and Sudurpashchim chapters.
- 225 JPG assets and 14 MP4 files, including thumbnails and separate web editions of some footage.
- Real spherical 360° photographs and a separately labeled artistic 3D Himalayan flight.
- Photo journals, cultural stories, Nepali/Sanskrit wordbook, district explorers and practical travel guides.
- Province journey outlines, departure dates, visitor-entered budgets, packing lists, notes and text travel briefs.
- Responsive styles, keyboard controls, reduced-motion support and photographer credits.

The Karnali Phoksundo film uses a YouTube embed and needs internet access. External Google Fonts and linked research pages also need internet access. The original photos, local MP4 files and bundled font are supplied in `media-parts/`. Run `python3 restore_assets.py` once to restore their exact original paths under `dist/assets/`. This verifies every part and restored file with SHA-256 without downloading anything or installing packages. The parts keep each transfer within the upload service limit.

## Project structure

| Path | Purpose |
| --- | --- |
| `dist/index.html` | National homepage |
| `dist/styles.css`, `dist/app.js`, `dist/upgrade.js` | Main design and interactions |
| `dist/*-data.js` | Destination, district, route and journal content |
| `dist/koshi.html` through the other province HTML files | Regional chapters |
| `dist/sudurpaschim.html` and `dist/farwest*` | Sudurpashchim chapter |
| `dist/journal*` | Shared photographic journal and wordbook |
| `dist/immersive-viewer.js`, `dist/software-viewer.js` | 360° viewer and artistic 3D rendering |
| `dist/assets/` | Media credits; images, videos and font appear here after restoration |
| `media-parts/`, `MEDIA-MANIFEST.json` | All original media in verified archive parts |
| `restore_assets.py` | Restore media before running or hosting |
| `dist/vendor/` | Vendored Three.js and its license |
| `docs/BUILD-NOTES.md` | Original creation notes, research details and edition-specific validation |
| `SOURCE-VERSION.json` | Provenance of this source export |

These files are the editable source. There is no separate compiled frontend. To host the website elsewhere, run `python3 restore_assets.py`, then publish the contents of `dist/` on a static web host and preserve the relative paths.

## Data and behavior

Saved places, routes, notes and plans use browser-local storage. They are specific to the browser and website origin and do not automatically move between the hosted site and localhost. This is a travel inspiration and planning website; it has no booking, payment, user-account or server-database system. Route outlines are planning aids, not confirmed travel arrangements.

## Credits

Keep photographer credits and the individual image/video license notices when reusing the assets. The in-page credits and `dist/assets/**/media-manifest.json` files retain original sources, creators, licenses and transformations. Additional credits are in `dist/assets/immersive/media-credits.json`, `dist/assets/journal/` and `dist/app.js`. Three.js and the bundled font have their own license notices in `dist/vendor/` and `dist/assets/fonts/`.

## Verification

The published Karnali edition passed JavaScript syntax, catalog, file/reference, image, route and static DOM checks. All website source files match the published revision. Clean-folder media restoration and every media checksum were verified. Browser preview was unavailable for the latest province editions, so current browser layout, video playback and download completion remain unverified. Earlier browser validation in the build notes applies to the editions identified there.
