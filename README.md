# Studio Monjo website

Static site for [studiomonjo.com](https://studiomonjo.com), hosted on **GitHub Pages** from the repository root.

Four pages:

- `/` — home (brand lobby)
- `/notebooks/` — commerce: A6 / A5 commissions, process, past commissions, FAQ
- `/essays/` — writing (essays on Brunch)
- `/about/` — Jordan

No backend. Commerce runs through the Naver Shop (link-out) with email fallback for international and pre-launch orders.

## Local preview

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`. A local server is required so JSON files load via `fetch`.

## Project layout

| Path                           | Purpose                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| `index.html`                   | Home                                                                    |
| `notebooks/index.html`         | Commerce page (offerings, process, past commissions, FAQ, final CTA)    |
| `essays/index.html`            | Writing page (full list)                                                |
| `about/index.html`             | About page                                                              |
| `css/styles.css`               | Shared styles (minimal black & white)                                   |
| `js/notebooks.js`              | Renders offerings, portfolio, FAQ, home strip; wires commission CTAs    |
| `js/essays.js`                 | Renders essay list(s) from `data/brunch-featured.json`                  |
| `js/site.js`                   | Lightbox, mobile nav, scroll-reveal                                     |
| `data/notebooks.json`          | **Source of truth for commerce** — offerings, portfolio, FAQ, prices    |
| `data/brunch-featured.json`    | Featured + full Brunch posts (generated; safe to commit)                |
| `scripts/sync-brunch-feed.mjs` | Refreshes the Brunch JSON from the RSS feed                             |
| `media/`                       | Source images (gitignored); `media/web/` holds resized copies (served)  |
| `CNAME`                        | Custom domain for GitHub Pages                                          |

## Commerce — editing `data/notebooks.json`

Everything commerce-related is a JSON edit.

```json
{
  "contactEmail": "hello@studiomonjo.com",
  "naverShopUrl": "",
  "leadTimeWeeks": 2,
  "offerings": [ ... A6, A5 with prices ... ],
  "portfolio": [ ... past commissions (sold) ... ],
  "faq": [ ... questions/answers ... ]
}
```

### Opening the Naver Shop

Set `naverShopUrl` at the top level. Every primary "Commission" button across the site flips from `mailto:` to the shop URL automatically, and the secondary "International ↗" button appears. For a per-size deep-link, add `"naverUrl": "https://..."` to the offering — it overrides the global URL.

### Contact email

Update `contactEmail` — it drives the mailto prefills used while the shop isn't live (and the international button afterwards). Each CTA builds a subject + body for the specific size ordered.

### Adding a new past commission

1. Drop originals into `media/notebooks/` (gitignored).
2. Resize to ~1600px long edge into `media/web/notebooks/` and emit a `.webp`:

   ```bash
   magick media/notebooks/NEW.jpg -auto-orient -colorspace sRGB -strip \
     -resize '1600x1600>' -quality 85 media/web/notebooks/NEW.jpg
   cwebp -q 82 media/web/notebooks/NEW.jpg -o media/web/notebooks/NEW.webp
   ```

3. Append to `portfolio` in `data/notebooks.json`:

   ```json
   {
     "id": "past-003",
     "title": "No. 003 — <name>",
     "year": 2026,
     "size": "A6",
     "status": "sold",
     "image": "/media/web/notebooks/NEW.jpg",
     "imageWebp": "/media/web/notebooks/NEW.webp",
     "gallery": [
       { "src": "/media/web/notebooks/NEW.jpg", "webp": "/media/web/notebooks/NEW.webp", "caption": "No. 003 — Cover" }
     ]
   }
   ```

### Changing prices or copy

Prices live in `offerings[].price` as `{ "krw": 38000, "eur": 26 }`. Descriptions, sizes, FAQ text are all in the same file.

## Essays (Brunch)

Each post has a stable URL: `https://brunch.co.kr/@444d2811f4b84ad/<articleId>`.

The browser can't call Brunch directly (no CORS on the RSS feed), so a JSON file is generated from it. Refresh (Node 18+):

```bash
node scripts/sync-brunch-feed.mjs
```

Writes `data/brunch-featured.json` with:

- `articleCount`
- `featured` — top N (N = `FEATURED_COUNT`, default 4) for the home teaser
- `all` — every post, used on `/essays/`

Edit `FEATURED_COUNT` in the script to change the home teaser count.

The RSS URL is `https://brunch.co.kr/rss/@@hqSD`.

## Media pipeline

Originals under `media/` are gitignored. Web-optimized copies live under `media/web/` and are committed. Asset paths in HTML and JSON are absolute (`/media/web/...`) so they resolve correctly across all four pages.

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
