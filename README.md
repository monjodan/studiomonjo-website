# Studio Monjo website

Static site for [studiomonjo.com](https://studiomonjo.com), hosted on **GitHub Pages** from the repository root.

Bilingual (EN / KO), six pages per locale:

- `/` — language-detection redirect (falls through to `/en/` by default, or the user's saved locale)
- `/en/` and `/ko/` — home (compact split-hero, three product tiles, three studio bands)
- `/en/shop/` and `/ko/shop/` — unified product grid for all three categories with sticky filter chips (category + sold/hide)
- `/en/materials/` and `/ko/materials/` — the four makers behind every piece (Canson, Iroful, Nevskaya Palitra, Sajou). At-a-glance index card row at the top, full storytelling sections below.
- `/en/workshops/` and `/ko/workshops/` — three-hour bind-and-paint class in Seoul, ₩150,000 per seat
- `/en/essays/` and `/ko/essays/` — writing (essays on Brunch)
- `/en/about/` and `/ko/about/` — about

The catalog lives in `data/notebooks.json` under three product categories, each with its own default size and price. JS renders the editions into the shop page; per-category and per-edition fields override the defaults.

| Category | Size | Default price |
| --- | --- | --- |
| `notebook` | A5, 24 pages | ₩65,000 |
| `bound-card` | A6, 1 page | ₩25,000 |
| `postcard` | 10.5 × 15.5 cm | ₩15,000 |

All editions are runs of 20, hand-numbered. Old `/notebooks/` and `/letters/` URLs (root and per-locale) meta-refresh to the right `/shop/#category` anchor.

No backend. Commerce runs through two external shops (the Naver Shop for Korea, a French shop for everywhere else), linked from each product's detail modal. URLs are set in `data/notebooks.json`.

## Local preview

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`. A local server is required so the JSON files load via `fetch`.

## Project layout

| Path                           | Purpose                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| `index.html`                   | Root redirect to the user's locale                                      |
| `en/…`, `ko/…`                 | Locale-specific pages (static HTML for SEO)                             |
| `notebooks/…`, `letters/…`, `about/…`, etc. | Legacy-URL redirects to the right locale + shop anchor      |
| `css/styles.css`               | Shared styles (minimal black & white)                                   |
| `js/i18n.js`                   | Locale catalog + helpers (`window.SM.T`, `window.SM.pickLocalized`)     |
| `js/notebooks.js`              | Renders edition cards + FAQ + home shop tiles from `data/notebooks.json`|
| `js/shop-filters.js`           | Sticky filter row on `/shop/` (category chips + hide-sold toggle)       |
| `js/product.js`                | Product detail modal (gallery + dual Buy buttons)                       |
| `js/essays.js`                 | Renders essay list(s) from `data/brunch-featured.json`                  |
| `js/site.js`                   | Mobile nav, scroll-reveal                                                |
| `data/notebooks.json`          | **Source of truth for the shop**: categories, editions, FAQ, shop URLs  |
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
  "categoryOrder": ["notebook", "bound-card", "postcard"],
  "categories": {
    "notebook":   { "label_en": "Notebooks",   "label_ko": "노트",        "size": "A5",            "pages": 24, "price": { "krw": 65000 } },
    "bound-card": { "label_en": "Bound cards", "label_ko": "바운드 카드", "size": "A6",            "pages": 1,  "price": { "krw": 25000 } },
    "postcard":   { "label_en": "Postcards",   "label_ko": "엽서",        "size": "10.5 × 15.5 cm", "pages": 1,  "price": { "krw": 15000 } }
  },
  "editions": [ ... ],
  "faq": [ ... ]
}
```

`categoryOrder` controls the order of filter chips in the shop and tiles on the home. Each `categories[key]` carries the default size, page count, price, and lede for that product type. Per-edition fields override the category defaults.

### Adding a new edition

1. Drop originals into `media/notebooks/` (gitignored).
2. Resize to ~1600px long edge into `media/web/notebooks/` and emit a `.webp`:

   ```bash
   magick media/notebooks/NEW.jpg -auto-orient -colorspace sRGB -strip \
     -resize '1600x1600>' -quality 85 media/web/notebooks/NEW.jpg
   cwebp -q 82 media/web/notebooks/NEW.jpg -o media/web/notebooks/NEW.webp
   ```

3. Append an entry to `editions` in `data/notebooks.json`. **Set `category`** to one of `notebook`, `bound-card`, or `postcard`:

   ```json
   {
     "id": "ed-n-003",
     "category": "notebook",
     "number": 3,
     "title_en": "Notebook 03",
     "title_ko": "노트 03",
     "name_en": "<English cover name>",
     "name_ko": "<Korean cover name>",
     "year": 2026,
     "soldCount": 0,
     "image": "/media/web/notebooks/NEW_cover.jpg",
     "imageWebp": "/media/web/notebooks/NEW_cover.webp",
     "gallery": [
       { "src": "/media/web/notebooks/NEW_cover.jpg", "webp": "/media/web/notebooks/NEW_cover.webp", "caption_en": "Cover", "caption_ko": "커버" },
       { "src": "/media/web/notebooks/NEW_detail.jpg", "webp": "/media/web/notebooks/NEW_detail.webp", "caption_en": "Detail", "caption_ko": "디테일" }
     ],
     "shortDescription_en": "One-line teaser.",
     "shortDescription_ko": "한국어 한 줄 설명.",
     "description_en": "Longer description shown in the product modal.",
     "description_ko": "상품 모달에 보여지는 긴 한국어 설명."
   }
   ```

For a **bound card** use `"category": "bound-card"`; for a **postcard** use `"category": "postcard"`. Size, page count, and price are inherited from the category default unless you set per-edition `size`, `pages`, or `price`.

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
