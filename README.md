# Studio Monjo Website

Static multilingual website for [studiomonjo.com](https://studiomonjo.com). The production repository uses GitHub Pages. Development and design reviews run locally; no hosted preview service or deployment is needed.

## Local preview

From this directory:

```sh
python3 scripts/serve.py
```

Open [the local site](http://127.0.0.1:8794/en/). This concurrent server disables caching and supports video byte-range requests. Use one server at a time on port 8794; the older single-threaded parent-directory server is superseded. Root-relative links require HTTP rather than opening HTML files directly.

## Pages

Each of `/en/`, `/fr/` and `/ko/` contains:

- The homepage, **a walk with Robey**: scrolling walks Robey across a drawn map of Seoul, from Namsan in the morning to the orange balloon at dusk. At each of the six places, his painting inks itself in and the first lines of his letter appear. The page then goes on to one lit window at night, the studio (folded, sewn, stamped, with a letter), the six notebooks (each opens up close), a blank page to write on (nothing is sent or saved), Robey's visit for companies, cafés and shops, and where to find the notebooks. A **Skip** pill jumps straight to the notebooks.
- `notebooks/`: the six Robey covers, the writing experience with the size guide, individual pieces, questions and how to buy.
- `about/`: Jordan's writing background, handmaking, Robey and encounters at markets.
- `company-editions/`: Brand and Illustration editions, practical details and an enquiry form.

The former localized `workshops/` URLs redirect to the story page. The root `/` chooses the saved or browser language. `/404.html` answers missing addresses in the three languages. `sitemap.xml` lists the current public pages.

The walk's motion is calm by construction: the camera follows the scroll through a critically damped spring with a speed limit (Robey's walking pace), and pan and zoom travel together along the smoothest path between two views. The dotted route is drawn on a canvas, which keeps Safari at 60 frames per second. With reduced motion, or without JavaScript, the walk becomes a quiet sequence of the six places. Changing language keeps the reader's place on the page.

## Editing

The site is ordinary static HTML generated from locale copy. No JavaScript framework or runtime build step is required.

- `content/en.json`, `content/fr.json`, `content/ko.json`: reviewed page and ordering copy. The walk's words are under `world`; they may use `<p>`, `<br>` and `<b>`, and prices are written as `{pocket_krw}`, `{standard_eur}` and so on, filled from `content/pricing-reference.json`.
- `content/prompts.json`: Robey's questions for the page you write (Mindful 12), in the three languages.
- `scripts/build-studio.py`: writes the twelve pages, the root language entry and the 404 page.
- `css/base.css`: shared paper, ink, type, header, postcard, prints, drawn windows and footer. `css/walk.css`, `js/walk.js`: the walk. `css/pages.css`: the notebooks, story and company pages. `css/buy.css`, `js/studio.js`: ordering, the size guide, the company form and the drawn windows, on every page.
- `media/web/world/`: the walk's map tiles, paintings with their line layers, Robey, landmarks, photographs and films. `media/web/studio/`: photographs of the notebooks, the studio and the markets.

After editing copy or templates:

```sh
python3 scripts/build-studio.py
```

Raise `VERSION` in `scripts/build-studio.py` whenever a stylesheet or script changes, so returning visitors never mix versions. The fonts are self-hosted subsets of Nanum Pen Script (Robey's pen), Gowun Batang and Gowun Dodum, all under the SIL Open Font License. The build warns when copy uses a character the subsets do not have; then run `python3 scripts/subset-fonts.py` in an environment with `fonttools` and `brotli`, and build again. Korean pages load every Korean syllable the site uses; English and French pages load only the few Korean words they show. Nanum Pen Script has no accented Latin letters, so the subset script draws them from the font's own strokes. Original font files stay in `assets/fonts/`. Commit the generated HTML and font files together with the source changes.

Share cards (`media/web/og/`, 1200 × 630, one per page and language) are drawn by `python3 scripts/render-share-cards.py`, which needs Playwright with Chrome and Pillow. Run it after changing a headline or the walk's opening.

The walk's five films (`media/web/world/video/`) are cut and graded by `python3 scripts/render-films.py`, which needs ffmpeg, numpy and Pillow, plus macOS `avconvert` to tone-map the iPhone's HDR clips. It reads the originals from the studio's shared drive (`04 Media Library/Originals/Video`) and Jordan's Desktop, crops each film to its window (4:5 for the studio steps, 9:16 for the night), plays it at 24 frames a second, loops it with a soft crossfade, brings each to the same warm paper white and gives all five one shared look. Cuts and crops are listed at the top of the script; run it only when a film changes.

The map was painted from OpenStreetMap geometry by the renderer kept with the design prototype (`../prototypes/monjo-slow/tools/`). Its credit, map data © OpenStreetMap contributors, appears in the walk's footer.

## Buying and enquiries

On the inner pages, a native dialog offers Korea (Naver), international orders (Instagram) and company enquiries (form or LinkedIn). The walk ends with the same routes as plain links. It keeps the selected notebook visible. All Korea purchases, including individual pieces, lead to Naver. International individual-piece enquiries lead to Instagram. The initial route follows the page language; a visitor’s explicit region choice is remembered locally. There is no IP geolocation or automatic message sending.

Direct Naver and Instagram links remain in the notebook page’s ordering section as a fallback without JavaScript. Company enquiries preserve the existing Formspree endpoint and POST fields. Tests must mock submission rather than send live enquiries.

Prices appear only at the buying moment: in the dialog's routes and, on the walk, inside each route's closed "Prices" note. In every language the Korea route shows KRW and the international route shows EUR plus shipping. EUR prices are rounded upward to the next €5 from the [ECB reference rate of 21 September 2026](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-krw.en.html); the calculation is recorded in `content/pricing-reference.json`, which is the only place prices are written. No live exchange-rate request is made by the website.

## GitHub Pages

The existing workflow builds the HTML and packages public pages, their referenced assets, and protected Naver shop media:

```sh
python3 scripts/build-studio.py
python3 scripts/check-seo.py
python3 scripts/test-package-pages.py
python3 scripts/package-pages.py
```

The `_site/` output is the complete deployment artifact. The packager checks local links, anchors, missing assets and exposed email addresses, including asset metadata. Copy sources, research notes, scripts and media without a website or Naver dependency are excluded. GitHub Pages serves ordinary static files; Python runs only during preparation. The root-relative URLs target the existing `studiomonjo.com` custom domain in `CNAME`.

### Naver shop image hosting

Naver product descriptions embed images directly from `https://studiomonjo.com/media/web/notebooks/`. These URLs are a public dependency even when no website page uses the image. Never delete or rename them merely because they appear unused on the website.

`content/naver-media.json` protects all 58 image paths found in the 15 HTML sources in [the maintained Naver Store folder](https://drive.google.com/drive/folders/14f5y4LsqxAwwKXP6J94k_A2OrTlXrnr0), audited on 27 September 2026. This includes 44 paths used by the nine documented live listing sources and preserves legacy/prototype URL compatibility. The original JPEGs and animated GIFs stay in `media/web/notebooks/`; the private listing documents and dependency manifest are not published. Packaging fails if the manifest or any protected asset is missing or unsafe.

When a listing adds a website-hosted image, commit its approved public asset and add its exact repository-relative path to this manifest before publishing the listing. Keep existing paths until every external reference has been deliberately retired. After deploying, verify HTTP responses, media content types and original file bytes:

```sh
python3 scripts/check-naver-media.py
```

The same check accepts `--base-url http://127.0.0.1:8795` to verify a local server serving `_site/`.

## Search and AI discovery

`scripts/seo.py` generates search titles, descriptions, social previews (a share card per page and language) and a consistent Organization, Person, WebSite and page graph from the locale copy. Notebook collections use ItemList data with links to the six visible covers; company editions describe a Service. No stock status, ratings or studio street coordinates are invented. Customer questions are rendered as ordinary visible HTML.

The sitemap contains the 12 canonical pages and reciprocal language alternates. The root language entry remains crawlable and carries the shared site-name graph, while preserving language routing and the English canonical target. Retired workshop URLs are noindex redirects. Set `CONTENT_MODIFIED` in `scripts/seo.py` only when published page content changes. `scripts/check-seo.py` runs in CI before packaging and verifies canonical URLs, language clusters, metadata, structured data, images, guides and privacy.

`robots.txt` permits search crawlers, including AI search crawlers. `/llms.txt` is an optional factual guide; `/llms-full.txt` is generated from visible editorial page text so it stays in sync. These files are conveniences for systems that use them, not a Google ranking feature: [Google’s current AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) applies ordinary search fundamentals. Publishing does not guarantee indexing or AI citations. The deployed sitemap can also be submitted in the studio’s verified webmaster accounts.

## Design and content references

The walk with Robey (28 September 2026) replaced the filmed homepage and gave every page its paper, navy linen and pen hand; the design prototype and its review notes are in `../prototypes/monjo-slow/`. The earlier September 2026 revision draws on the approved 15 September Incheon Illustration Korea copy, the September LinkedIn visual system, July partner/corporate decks, and the studio’s writing platform. The palette is navy `#16243F`, white `#FFFFFF`, deep ink `#131A2A` and restrained red `#B0392E`, on paper and navy linen textures. Robey speaks in Nanum Pen Script; the studio speaks in Gowun Batang, with Gowun Dodum for small labels.

The current notebooks have **blank 105gsm pages with removable lined and grid guides**. Individual-piece photographs illustrate examples, not guaranteed stock. Company imagery shows Studio Monjo samples, not claimed client commissions. Raw photography and videos are kept outside this repository and were not modified.
