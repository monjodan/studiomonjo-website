# Studio Monjo website

Static site for [studiomonjo.com](https://studiomonjo.com), hosted on **GitHub Pages** from the repository root (`index.html`).

## Local preview

From this directory:

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`. A simple server is required so `data/brunch-featured.json` and assets load correctly.

## Project layout


| Path                           | Purpose                                                           |
| ------------------------------ | ----------------------------------------------------------------- |
| `index.html`                   | Main page                                                         |
| `css/styles.css`               | Styles                                                            |
| `js/essays.js`                 | Loads essay cards from JSON                                       |
| `data/brunch-featured.json`    | Featured Brunch posts (generated; safe to commit)                 |
| `scripts/sync-brunch-feed.mjs` | Refreshes that JSON from Brunch’s RSS feed                        |
| `media/`                       | Source images; `media/web/` holds resized copies used on the site |
| `CNAME`                        | Custom domain for GitHub Pages                                    |


## Brunch essays (per-post links and “dynamic” data)

Each post has a stable URL of the form:

`https://brunch.co.kr/@444d2811f4b84ad/<articleId>`

The site does **not** call Brunch from the browser: their RSS feed does not allow cross-origin `fetch` from your domain, so the homepage uses a small JSON file instead.

**Refresh titles, excerpts, and links from the live RSS feed** (requires Node 18+):

```bash
node scripts/sync-brunch-feed.mjs
```

That writes `data/brunch-featured.json` with:

- `articleCount` — total posts in the feed (used for “View all N essays”)
- `featured` — the newest posts (default: **4**), each with `url`, `title`, and `excerpt`

To show more or fewer featured posts, edit `FEATURED_COUNT` in `scripts/sync-brunch-feed.mjs` and run the script again.

The RSS URL is `https://brunch.co.kr/rss/@@hqSD` (Brunch exposes this on your profile). Profile links use `@444d2811f4b84ad` so URLs stay consistent with your public profile.

## Media

Large originals live under `media/`; web-optimized versions are generated under `media/web/` (for example with ImageMagick). Re-run your resize step when you add images.

## GitHub Pages

In the repository **Settings → Pages**, set the source to deploy from the `main` branch and the **root** folder. The `CNAME` file should match your custom domain in the Pages settings.