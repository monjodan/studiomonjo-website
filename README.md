# Studio Monjo website

Static site for [studiomonjo.com](https://studiomonjo.com), hosted on **GitHub Pages** from the repository root.

Bilingual (EN / KO), six pages per locale:

- `/` — language-detection redirect (falls through to `/en/` by default, or the user's saved locale)
- `/en/` and `/ko/` — home (brand + hero, "Art that follows writing")
- `/en/notebooks/` and `/ko/notebooks/` — notebook editions (24 pages each)
- `/en/letters/` and `/ko/letters/` — letter card editions (one page each, for gifting / love letters)
- `/en/materials/` and `/ko/materials/` — the four makers behind every piece (Canson, Iroful, Nevskaya Palitra, Sajou)
- `/en/essays/` and `/ko/essays/` — writing (essays on Brunch)
- `/en/about/` and `/ko/about/` — about

Both products (notebooks + letters) share the same data model, the same editions-of-20 system, the same product detail modal, and the same Buy buttons (Korea + France). They differ only in category + page count (24 vs 1).

No backend. Commerce runs through two external shops — the Naver Shop for Korea, and a French shop for everywhere else — linked from each product's detail modal. URLs are set in `data/notebooks.json`.

## Local preview

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`. A local server is required so the JSON files load via `fetch`.

## Project layout

| Path                           | Purpose                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| `index.html`                   | Root redirect to the user's locale                                      |
| `en/…`, `ko/…`                 | Locale-specific mirrored pages (static HTML for SEO)                    |
| `notebooks/…`, `essays/…`, `about/…` | Legacy-URL redirects to the right locale                          |
| `css/styles.css`               | Shared styles (minimal black & white)                                   |
| `js/i18n.js`                   | Locale catalog + helpers (`window.SM.T`, `window.SM.pickLocalized`)     |
| `js/notebooks.js`              | Renders edition cards + FAQ from `data/notebooks.json`                  |
| `js/product.js`                | Product detail modal (gallery + dual Buy buttons)                       |
| `js/essays.js`                 | Renders essay list(s) from `data/brunch-featured.json`                  |
| `js/site.js`                   | Lightbox (legacy), mobile nav, scroll-reveal                            |
| `data/notebooks.json`          | **Source of truth for the shop** — editions, FAQ, shop URLs             |
| `data/brunch-featured.json`    | Featured + full Brunch posts (generated; safe to commit)                |
| `scripts/sync-brunch-feed.mjs` | Refreshes the Brunch JSON from the RSS feed                             |
| `media/`                       | Source images (gitignored); `media/web/` holds resized copies (served)  |
| `sitemap.xml` · `robots.txt`   | SEO plumbing                                                            |
| `CNAME`                        | Custom domain for GitHub Pages                                          |

## The editions model

Each design is produced in a **limited run of 20**. Every copy is hand-numbered. Once all twenty of a design are sold, the edition is closed and the design is never produced again. The site tracks this via `soldCount` vs the global `editionSize` (default 20):

- `soldCount < editionSize` → card shows *"N of 20 remaining"*, opens the detail modal with Buy buttons.
- `soldCount === editionSize` → card shows *"Sold out"* (black pill), opens the detail modal which shows *"Sold out — edition of 20 complete."* instead of the Buy buttons.
- Cards sort with available editions first.

## Shop wiring (the two Buy buttons)

The product detail modal has two Buy buttons: **Buy in Korea** and **Buy in France**. Each button URL is resolved per-edition:

1. `edition.buyKorea` / `edition.buyFrance` — optional per-design overrides.
2. `shopKorea` / `shopFrance` — top-level fallbacks in `data/notebooks.json`.

If a region has no URL, its button renders as *"[Region] shop · opening soon"* and is visibly disabled (users can tell the option exists, just not yet). Both-missing shows an equivalent fine-print note.

To go live:

```json
{
  "shopKorea": "https://smartstore.naver.com/your-shop",
  "shopFrance": "https://your-french-shop.example/studio-monjo"
}
```

## Editing `data/notebooks.json`

```json
{
  "editionSize": 20,
  "shopKorea": "",
  "shopFrance": "",
  "editions": [ ... ],
  "faq": [ ... ]
}
```

### Adding a new edition

1. Drop originals into `media/notebooks/` (gitignored).
2. Resize to ~1600px long edge into `media/web/notebooks/` and emit a `.webp`:

   ```bash
   magick media/notebooks/NEW.jpg -auto-orient -colorspace sRGB -strip \
     -resize '1600x1600>' -quality 85 media/web/notebooks/NEW.jpg
   cwebp -q 82 media/web/notebooks/NEW.jpg -o media/web/notebooks/NEW.webp
   ```

3. Append an entry to `editions` in `data/notebooks.json`. **Set `category`** to `"notebook"` or `"letter"` — it controls which page the edition shows up on:

   ```json
   {
     "id": "ed-003",
     "category": "notebook",
     "title": "No. 003",
     "name_en": "<English cover name>",
     "name_ko": "<Korean cover name>",
     "size": "A6",
     "pages": 24,
     "year": 2026,
     "soldCount": 0,
     "price": { "krw": 38000, "eur": 26 },
     "image": "/media/web/notebooks/NEW_cover.jpg",
     "imageWebp": "/media/web/notebooks/NEW_cover.webp",
     "gallery": [
       { "src": "/media/web/notebooks/NEW_cover.jpg", "webp": "/media/web/notebooks/NEW_cover.webp", "caption_en": "Cover", "caption_ko": "커버" },
       { "src": "/media/web/notebooks/NEW_detail.jpg", "webp": "/media/web/notebooks/NEW_detail.webp", "caption_en": "Detail", "caption_ko": "디테일" }
     ],
     "shortDescription_en": "One-line teaser in English.",
     "shortDescription_ko": "한국어 한 줄 설명.",
     "description_en": "Longer English description shown in the product modal.",
     "description_ko": "상품 모달에 보여지는 긴 한국어 설명."
   }
   ```

For a **letter card**, use `"category": "letter"` and `"pages": 1`. The features strip and the product modal adjust automatically.

All user-facing copy that isn't in the data file lives in `js/i18n.js` — add new keys there (both `en` and `ko`).

### Updating sold counts

Increment `soldCount` on the edition. When it reaches `editionSize`, the card automatically flips to *Sold out* and the Buy buttons disappear in the modal.

### Overriding a shop URL per edition

```json
{
  "id": "ed-003",
  "buyKorea": "https://smartstore.naver.com/your-shop/products/XYZ",
  "buyFrance": "https://your-french-shop.example/products/ed-003"
}
```

## Essays (Brunch)

Each post has a stable URL: `https://brunch.co.kr/@444d2811f4b84ad/<articleId>`.

The browser can't call Brunch directly (no CORS on the RSS feed), so a JSON file is generated from it. Refresh (Node 18+):

```bash
node scripts/sync-brunch-feed.mjs
```

Writes `data/brunch-featured.json` with `articleCount`, a `featured` list, and a full `all` list.

## Media pipeline

Originals under `media/` are gitignored. Web-optimized copies live under `media/web/` and are committed. Asset paths in HTML and JSON are absolute (`/media/web/...`) so they resolve correctly across all pages.

## GitHub Pages and custom domain (`studiomonjo.com`)

### Repo

| Requirement | Status |
|-------------|--------|
| `CNAME` in the repo root contains exactly `studiomonjo.com` | Yes |
| **Settings → Pages → Build and deployment**: source = **Deploy from a branch**, branch = **`main`**, folder = **`/ (root)`** | Confirm in GitHub |
| **Settings → Pages → Custom domain**: `studiomonjo.com` | Confirm in GitHub |
| **Enforce HTTPS** — enable once the cert is issued | After DNS is green |

### DNS (at the registrar)

- `A` records on the apex (`@`):
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- `www` — CNAME to `monjodan.github.io`.

Official reference: [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
