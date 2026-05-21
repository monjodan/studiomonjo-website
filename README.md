# Studio Monjo Website

Static site for [studiomonjo.com](https://studiomonjo.com), hosted on GitHub Pages from the repository root.

The public architecture is deliberately small:

- `/` redirects to the visitor's saved or browser language.
- `/en/`, `/ko/`, `/fr/` are the three-door home pages.
- `/courrier/` is the French-only Courrier de Séoul product page.
- `/en/notebooks/`, `/ko/notebooks/`, `/fr/notebooks/` are matching notebook pages.
- `/en/workshops/`, `/ko/workshops/`, `/fr/workshops/` are matching workshop pages.

Legacy product URLs are kept only as redirects:

- `/notebooks/` redirects to the current locale's notebooks page.
- `/materials/` redirects to the current locale's notebooks page.
- `/letters/` redirects to `/courrier/`.
- Per-locale `/shop/`, `/materials/`, and `/letters/` pages redirect to the same destinations.

There is no backend and no generated shop grid in this version. The notebooks page explains the edition model and sends buyers to Naver.

## Local Preview

Use a local server. Opening pages directly with `file://` will break root-relative links such as `/fr/notebooks/`.

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Project Layout

| Path | Purpose |
| --- | --- |
| `index.html` | Locale redirect |
| `en/`, `ko/`, `fr/` | Trilingual home, notebooks, workshops, and redirects |
| `courrier/` | French-only Courrier de Séoul product page |
| `notebooks/`, `materials/`, `letters/` | Compatibility redirects |
| `css/styles.css` | Shared home, workshop, and chrome styles |
| `js/home-arrival.js` | Door hover/tap behavior on the home page |
| `js/lang-pill.js` | Shared language dropdown |
| `js/site.js` | Shared reveal behavior |
| `media/web/` | Optimized media served by the site |
| `sitemap.xml`, `robots.txt`, `CNAME` | SEO and GitHub Pages plumbing |

## Editions Model

Each notebook edition starts with one original watercolour. The original is sold as a 1/1 artwork. The image is scanned in high quality and printed on fifty notebook covers. Each notebook is sealed in red before shipping. Customers choose the format, binding thread, and inside page style.

Paper is chosen carefully for each edition and may change when the artwork or writing experience calls for a different sheet.

## Media Pipeline

Originals under `media/` are gitignored. Web-optimized copies live under `media/web/` and are committed. Asset paths in HTML are root-relative so they resolve correctly on GitHub Pages and in local server previews.

## GitHub Pages

`CNAME` contains `studiomonjo.com`. In GitHub Pages settings, deploy from the `main` branch, repository root.
