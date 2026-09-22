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

- A filmed homepage, with three paths into the studio.
- `notebooks/`: the six Robey covers, the writing experience, individual pieces and ordering.
- `about/`: Jordan’s writing background, handmaking, Robey and encounters at markets.
- `company-editions/`: Brand and Illustration editions, practical details and an enquiry form.

The former localized `workshops/` URLs redirect to the story page. The root `/` chooses the saved or browser language. `sitemap.xml` lists the current public pages.

## Editing

The three inner pages share templates and locale copy, but the delivered site is ordinary static HTML. No JavaScript framework or runtime build step is required.

- `content/en.json`, `content/fr.json`, `content/ko.json`: reviewed page and ordering copy.
- `scripts/build-studio.py`: writes the nine inner pages and refreshes the homepage’s copy, navigation and order dialog.
- `css/studio.css`: navy and white inner-page design.
- `css/monjo.css`, `js/bench.js`: filmed homepage.
- `css/buy.css`, `js/studio.js`: shared ordering, navigation and company form behavior.
- `media/web/studio/`: optimized photographs and the writing clip, which plays silently when visible. Native controls remain available; reduced-motion preferences disable automatic playback.

After editing copy or templates:

```sh
python3 scripts/build-studio.py
```

If new characters are introduced, regenerate the WOFF2 font subsets with `python3 scripts/subset-fonts.py` in an environment containing `fonttools` and `brotli`. Original font files remain available. Commit the generated HTML and font files together with the source changes.

## Buying and enquiries

A native dialog offers Korea (Naver), international orders (Instagram) and company enquiries (form or LinkedIn). It keeps the selected notebook visible. All Korea purchases, including individual pieces, lead to Naver. International individual-piece enquiries lead to Instagram. The initial route follows the page language; a visitor’s explicit region choice is remembered locally. There is no IP geolocation or automatic message sending.

Direct Naver and Instagram links remain in the notebook page’s ordering section as a fallback without JavaScript. Company enquiries preserve the existing Formspree endpoint and POST fields. Tests must mock submission rather than send live enquiries.

English prices use EUR, rounded upward to the next €5 from the [ECB reference rate of 21 September 2026](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-krw.en.html). The calculation is recorded in `content/pricing-reference.json`; French and Korean prices remain in KRW. No live exchange-rate request is made by the website.

## GitHub Pages

The existing workflow builds the HTML and packages only public pages and their referenced assets:

```sh
python3 scripts/build-studio.py
python3 scripts/check-seo.py
python3 scripts/package-pages.py
```

The `_site/` output is the complete deployment artifact. The packager checks local links, anchors, missing assets and exposed email addresses, including asset metadata. Copy sources, research notes, scripts and unused media are excluded. GitHub Pages serves ordinary static files; Python runs only during preparation. The root-relative URLs target the existing `studiomonjo.com` custom domain in `CNAME`.

## Search and AI discovery

`scripts/seo.py` generates search titles, descriptions, social previews and a consistent Organization, Person, WebSite and page graph from the locale copy. Notebook collections use ItemList data with links to the six visible covers; company editions describe a Service. No stock status, ratings or studio street coordinates are invented. Customer questions are rendered as ordinary visible HTML.

The sitemap contains the 12 canonical pages and reciprocal language alternates. The root language entry remains crawlable and carries the shared site-name graph, while preserving language routing and the English canonical target. Retired workshop URLs are noindex redirects. Set `CONTENT_MODIFIED` in `scripts/seo.py` only when published page content changes. `scripts/check-seo.py` runs in CI before packaging and verifies canonical URLs, language clusters, metadata, structured data, images, guides and privacy.

`robots.txt` permits search crawlers, including AI search crawlers. `/llms.txt` is an optional factual guide; `/llms-full.txt` is generated from visible editorial page text so it stays in sync. These files are conveniences for systems that use them, not a Google ranking feature: [Google’s current AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) applies ordinary search fundamentals. Publishing does not guarantee indexing or AI citations. The deployed sitemap can also be submitted in the studio’s verified webmaster accounts.

## Design and content references

The September 2026 revision draws on the approved 15 September Incheon Illustration Korea copy, the September LinkedIn visual system, July partner/corporate decks, and the studio’s writing platform. The current palette is navy `#16243F`, white `#FFFFFF`, deep ink `#131A2A` and restrained red `#B0392E`. Headings use Noto Serif KR, with Noto Sans KR for body text.

The current notebooks have **blank 105gsm pages with removable lined and grid guides**. Individual-piece photographs illustrate examples, not guaranteed stock. Company imagery shows Studio Monjo samples, not claimed client commissions. Raw photography and videos are kept outside this repository and were not modified.
