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

## GitHub Pages and custom domain (`studiomonjo.com`)

### In this repository (already in place)

| Requirement | Status |
|-------------|--------|
| `CNAME` in the repo root contains exactly `studiomonjo.com` | Yes |
| **Settings → Pages → Build and deployment**: source = **Deploy from a branch**, branch = **`main`**, folder = **`/ (root)`** | Confirm in GitHub |
| **Settings → Pages → Custom domain**: `studiomonjo.com` (save; wait for DNS check) | Confirm in GitHub |
| Optional: **Enforce HTTPS** enabled after the certificate is issued | After DNS is green |

### DNS at your registrar (for `studiomonjo.com`)

GitHub needs the apex domain to hit their IPs, and usually `www` as an alternate name:

- **A records** for `studiomonjo.com` (apex / `@`) — all four:

  `185.199.108.153`  
  `185.199.109.153`  
  `185.199.110.153`  
  `185.199.111.153`

- **`www`** — **CNAME** to `monjodan.github.io` (no `https://`, no repo name).

Official reference: [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

### If GitHub still shows “NotServedByPagesError” but the site loads

Live checks can show the domain already serving from GitHub while the **Pages settings** panel is still catching up or stuck. Try:

1. **Settings → Pages → Custom domain** — enter `studiomonjo.com` again and click **Save**.
2. Toggle **Enforce HTTPS** off and on after the certificate exists (if needed).
3. Wait up to an hour for DNS/propagation caches and GitHub’s recheck.

Removing and re-adding the custom domain in Pages settings (without changing DNS) often clears a stale error.