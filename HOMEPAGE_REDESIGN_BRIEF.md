# Studio Monjo — Homepage Redesign Brief

**Author:** Jordan (with design exploration assistance)
**Date:** May 2026
**Status:** Ready for implementation
**Scope:** Replace `/en/index.html` and `/ko/index.html`. Update `/notebooks/` to remove on-site commerce. Add new `/workshops/` page (stub acceptable for v1).

---

## 1. Why we are doing this

The current site treats Studio Monjo as a shop with editorial supporting it. That has stopped feeling true. Three things are now real about the practice:

1. **NaverShop is the only sales channel.** On-site e-commerce is being retired. We do not need cart, checkout, product pages with buy buttons, or the existing piece grid as a transactional surface.
2. **Courrier (the monthly letter) and the notebooks/cards are different products** living different lives. They should coexist on the site as peers, not be folded into one "shop."
3. **Workshops are a third, distinct offer** that doesn't fit either of the above.

The new homepage frames Studio Monjo as an **arrival station with three doors**. The visitor lands, takes a breath, and chooses which world to enter. There is no scroll on desktop. The site fits in one viewport.

---

## 2. What changes, in one paragraph

Rebuild the homepage as a single-viewport landing with three equal vertical doors (Courrier, Notebooks & Cards, Workshops), a brief one-time loading moment, a floating logo, a floating language toggle, and per-door background video that previews on hover. Convert `/notebooks/` from a shop into an explanation page that ends in a NaverShop link. Add a minimal `/workshops/` page. Leave Courrier (`/letters/`), About, Essays, and Materials in place — they continue to work as deep destinations and stay accessible from the doors and from internal navigation, but they are not surfaced on the new homepage.

---

## 3. Inventory: what stays, what changes, what goes

**Stays (untouched):**
- `/index.html` (root redirector)
- `/en/letters/` and `/ko/letters/` (Courrier subscription page — link target for door 01)
- `/en/about/`, `/ko/about/`
- `/en/essays/`, `/ko/essays/`
- `/en/materials/`, `/ko/materials/`
- All shared CSS variables, typography stack, and Korean i18n logic in `/css/styles.css`
- Brand mark (`/media/web/branding/`)

**Changes:**
- `/en/index.html` and `/ko/index.html` — full rebuild as the doors page (see §5)
- `/en/notebooks/` and `/ko/notebooks/` — strip purchase actions, retain editorial content (process, materials, gallery), end with a single CTA to NaverShop. No prices, no buy buttons, no product detail modal.

**New:**
- `/en/workshops/` and `/ko/workshops/` — minimal page describing the workshop format. v1 can be a single page with hero, short description, and an expression-of-interest form or mailto link. A prior draft exists in the worktree `.claude/worktrees/dreamy-bassi-82da9e/en/workshops/` — review it but do not assume it's correct.
- `/media/web/home-arrival/` — directory for the three background videos, three poster images, and one shared paper-texture default.

**Retired:**
- All on-site shop pages: `/en/shop/`, `/ko/shop/`, including all product detail pages currently nested under shop. Either delete them or 301-redirect to NaverShop. Recommend deletion since `noindex` is already set on the root.
- The commission modal (`.cmx-*` styles in styles.css). Leave the CSS in place for now; no homepage CTA opens it.
- Any cart/checkout JS.

---

## 4. The homepage in detail

### 4.1 Layout

One viewport tall. Three equal vertical columns, edge to edge. No header band. No footer band. The three doors fill 100% of the viewport between the floating chrome and the bottom edge.

```
+---------------------------------------------------------------+
| [logo-mark] Studio Monjo                            [EN ▾]    |  ← floating, transparent
+---------------------------------------------------------------+
|                |                       |                      |
|   [mark]       |   [mark]              |   [mark]             |
|   01           |   02                  |   03                 |
|                |                       |                      |
|   Courrier     |   Notebooks & cards   |   Workshops          |
|   ………………       |   …………………………………       |   ……………………………        |
|                |                       |                      |
|  [Learn more]  |  [Learn more]         |  [Learn more]        |
|  [S'abonner]   |  [Naver Shop ↗]       |  [Sign up]           |
|                |                       |                      |
+----------------+-----------------------+----------------------+
```

### 4.2 Loading sequence (first visit only)

On first arrival in a session, before the doors render:

1. Full-bleed cream background (`#fdfcf7`).
2. Centered: 18px circle outline (the Studio Monjo "0" mark), then below it, italic Cormorant Garamond at 17px in `--ink-mid` reading **welcome to my world,**
3. Mark fades in at 200ms; text fades in at 500ms.
4. Hold for ~1.2 seconds.
5. Loading layer fades out over 800ms (1.8s mark to 2.6s mark).
6. Doors fade in over 900ms beginning at 2.2s.
7. Total intro: ~3.1 seconds.

**Persist with `localStorage` key `sm-arrival-seen=1`.** If present, skip the loading layer entirely and render doors immediately. Reset is fine on locale change. Honor `prefers-reduced-motion: reduce` by skipping the entire intro and rendering doors immediately on first load.

### 4.3 The doors (default state)

Each door is a `<section>` with:
- A small SVG mark at the top (~34px square). Suggested motifs:
  - Door 01 / Courrier — a stylized envelope outline in `--accent` red
  - Door 02 / Notebooks & cards — two stacked notebook outlines with a small accent dot
  - Door 03 / Workshops — a circle with four small dots arranged around its centerline
- A small numeral label `01` / `02` / `03` in `--ink-light`, uppercase, tracked at `0.28em`
- A title in Cormorant Garamond, 28–30px, weight 300, color `--ink`
- A one-sentence description in DM Sans, 12px, weight 300, line-height 1.7, color `--ink`/`--ink-mid`, max-width ~230px
- A two-button action row (see §4.4)

Default backgrounds (subtle warmth differentiates the three without making them feel like different brands):
- Door 01: `#fbf8f1` (warm cream)
- Door 02: `#ffffff` (paper white)
- Door 03: `#f5f3ec` (slightly cooler stone)

Equal weight. None should dominate by default.

### 4.4 Two CTAs per door

Each door ends with two side-by-side buttons:

| Door | Ghost button | Primary button | Primary destination |
|---|---|---|---|
| 01 Courrier | Learn more | **S'abonner** | `/en/letters/#subscribe` (anchor on existing letters page) |
| 02 Notebooks & cards | Learn more | **Naver Shop ↗** | `https://smartstore.naver.com/...` (final URL TBD by Jordan) — opens in new tab |
| 03 Workshops | Learn more | **Sign up** | `/en/workshops/#register` (or mailto fallback) |

Style: reuse `.btn-ghost` and `.btn-primary` from `/css/styles.css` exactly. Add 11px label, `0.16em` letterspacing. The "↗" arrow on the Naver button is `--ink-light`, not white — a small softening touch that signals "leaves the site" without shouting.

"Learn more" goes to the corresponding section page (`/en/letters/`, `/en/notebooks/`, `/en/workshops/`). Same target inside that section's locale.

### 4.5 Hover interaction (the heart of the page)

When the visitor hovers a door:

1. **A full-bleed background video** for that door fades in across the entire page over 550ms (not just under that door — across all three columns).
2. **All three doors become slightly translucent** (`background: rgba(255,255,255,0.62)` with a 2px backdrop-blur). The non-hovered doors get a touch more opaque (`0.82`) to keep them legible; the hovered door becomes more transparent (`0.18`) so the video shows through it most clearly.
3. **The hovered door's content nudges up by 4px** to feel like the door is "opening toward you."
4. On mouseleave, the background fades out over 550ms; doors return to their solid backgrounds.

Implement with the `:has()` selector on `.sm-page`:

```css
.sm-page:has(.sm-door-1:hover) .sm-bg-1 { opacity: 1; }
.sm-page:has(.sm-door:hover) .sm-door:not(:hover) { background: rgba(255,255,255,0.82); }
.sm-door:hover { background: rgba(255,255,255,0.18); }
```

Provide a JS fallback for browsers without `:has()` support (`< 0.5%` of traffic, but worth a defensive listener).

### 4.6 Floating chrome

**Logo (top-left, 18px from edge).** Small circle mark (`14px × 14px`, 1.2px border in `--ink`) plus the wordmark "STUDIO MONJO" in DM Sans 11px, weight 500, letter-spacing `0.18em`. No background. Links to `/` (the locale-aware redirector).

**Language toggle (top-right, 14px from edge).** A pill: `padding: 8px 12px`, `background: rgba(255,255,255,0.7)`, 0.5px hairline border, `border-radius: 999px`, `backdrop-filter: blur(4px)`. Label shows the current language (`EN` or `한국어`) plus a small `▾` in `--ink-light`. On click, expands to show the alternate language as a peer link. Reuses the existing `.lang-switch` semantics; only the visual treatment changes (floating pill vs inline). Respect the existing `sm-lang` localStorage key.

### 4.7 Mobile (`≤ 900px`)

No hover on touch. Three changes:

1. **Doors stack vertically** with each one taking ~33vh of the viewport (still fits one screen on most phones; very short phones get a tiny scroll, which is acceptable).
2. **Backgrounds auto-cycle.** On a 4-second interval, the page background cross-fades through video 1 → video 2 → video 3 → video 1. Pause cycling when the page is not visible (use the Page Visibility API). Honor `prefers-reduced-motion: reduce` by replacing video with a static painted vignette poster image per door.
3. **Floating chrome stays floating** but moves down 4px from edges to avoid notch/safe-area collisions. Use `env(safe-area-inset-top)` etc.

Tap a door anywhere → navigate to its "Learn more" target. The two-button row remains visible; the primary button works as a tap target as before.

---

## 5. Background videos

These are the soul of the page. Treat them as the most important art direction decision in the build.

**Production specs:**
- Format: MP4 (H.264) plus WebM (VP9) for Safari/Chrome respectively
- Length: **6–10 seconds, seamless loop**
- Resolution: 1920×1080, exported at ~1.0–1.5 MB per file (aggressive bitrate; these are background, not feature)
- **Muted, autoplay, loop, playsinline.** No audio track at all (saves bytes).
- Each video paired with a JPEG poster image at 1920×1080, ~80KB
- All assets in `/media/web/home-arrival/`:
  - `door-01-courrier.mp4` / `.webm` / `.jpg`
  - `door-02-notebooks.mp4` / `.webm` / `.jpg`
  - `door-03-workshops.mp4` / `.webm` / `.jpg`

**Loading strategy:**
- Do NOT preload videos. They do not appear until the visitor actually hovers (or auto-cycles on mobile).
- On desktop: lazy-load each video on first hover of its door. Show poster image immediately while the video buffers.
- On mobile: preload only the first video; lazy-load the next two as the cycle approaches them.
- If the connection is slow (`navigator.connection.effectiveType` is `2g` or `slow-2g`) or `prefers-reduced-motion: reduce`, never load video — show poster images only.

**Content direction (for Jordan, not the coding agent):**

These need to be shot in your studio, on your paper, with your hands. Stock footage will kill the magic. The vibe is *intimate, slow, no faces, no music*.

- **Courrier:** a fountain pen mid-word; ink pooling at the nib; an envelope being closed; a wax seal pressed.
- **Notebooks & cards:** a brush loading with pigment; one petal stroke meeting another; the spine of a hand-bound notebook turning.
- **Workshops:** hands setting down a teacup beside a brush; paper being passed across a table; multiple brushes resting in a shared water jar.

Shoot landscape, locked-off, daylight, slight slow motion in post. Loop point should be invisible.

---

## 6. Content, both locales

**English copy (final):**

| Door | Title | Description |
|---|---|---|
| 01 | Courrier | A monthly letter from Seoul, on hand-painted paper. An ongoing correspondence. |
| 02 | Notebooks & cards | Hand-painted notebooks and letter cards, made in small editions in Seoul. |
| 03 | Workshops | Small gatherings to paint, fold, and write together — in Seoul, by invitation. |

**Korean copy:** Jordan to provide. Use the existing `/ko/letters/`, `/ko/notebooks/` pages as voice reference. Apply the existing `html[lang="ko"]` rules in `styles.css` (Noto Sans KR / Nanum Myeongjo, tightened tracking, `word-break: keep-all`).

**Loading line:**
- EN: *welcome to my world,*
- KO: Jordan to provide. Suggest something with the same diaristic feel.

**Door numerals (`01 / 02 / 03`)** stay numeric in both locales.

---

## 7. Visual specs

Reuse `/css/styles.css` variables wherever possible. Do not introduce new tokens unless necessary.

- Paper background: `#fbf8f1` (slightly warmer than `--paper`; new value, reserved for the homepage)
- Loading background: `#fdfcf7`
- Door 1 / 2 / 3 backgrounds: `#fbf8f1` / `#ffffff` / `#f5f3ec`
- Hover background tints (videos behind them): `#fbf3e3` / `#fefcf6` / `#ece7d6` — these only show as a faint floor color while the video buffers
- Borders between doors: `0.5px solid rgba(10,10,10,0.06)`
- All ink colors: existing `--ink`, `--ink-mid`, `--ink-light`
- Accent red for SVG marks and seal: existing `--accent` (`#c8261e`)

Typography: existing `--serif` (Cormorant Garamond) and `--sans` (DM Sans). Korean: existing `--serif-ko` / `--sans-ko`. The title size on doors is `clamp(1.5rem, 2.5vw, 1.875rem)` (24–30px).

Spacing: door padding `64px 24px 32px` (top extra to clear the floating chrome). Vertical rhythm inside a door: 18px between mark and number, 14px between number and title, 12px between title and description, 24px above the action row.

Namespace new CSS classes with `home-arrival-` prefix (e.g. `home-arrival-page`, `home-arrival-door`, `home-arrival-bg`) so this work is clearly scoped and removable.

---

## 8. Accessibility

- The page is a `<main>` containing three `<section>` elements. Each section has an `<h2>` with the door title.
- The two action buttons in each door are real `<a>` elements with descriptive text (`aria-label="Subscribe to Courrier monthly letter"`, etc.).
- The hover-to-preview behavior is decorative; do not require it to access information. Keyboard users tab through each door; focus on a door triggers the same background-video preview as hover (`:focus-within` in addition to `:hover`).
- The language toggle is a `<button>` that opens a small list, not a hover-only menu.
- Skip link to main content remains, as in current `styles.css`.
- `prefers-reduced-motion: reduce` disables the loading sequence, the door content nudge, and all video. Posters become static painted vignettes.
- Contrast: door title at 28–30px on a light background is well above WCAG AA. The 11–12px small copy at `--ink` (`#0a0a0a`) on `#fbf8f1` is also AA-compliant. The translucent door state during hover must keep text legible — verify with the painted-blossom video as the test case.

---

## 9. Performance budget

- HTML for the homepage: ≤ 14KB gzipped
- New CSS additions: ≤ 6KB gzipped on top of existing `styles.css`
- JS: ≤ 4KB minified+gzipped (auto-cycle on mobile, `:has()` polyfill fallback, language toggle expansion)
- Initial paint: no video bytes loaded. First contentful paint should be the loading screen at < 1s on a fast 3G simulation.
- Largest contentful paint: the doors layer, < 2s.
- The first hovered video should start playing within 600ms on a typical broadband connection.

---

## 10. File structure

```
/index.html                                  ← unchanged (locale redirector)
/css/styles.css                              ← extend, do not break existing classes
/en/index.html                               ← REBUILD (the doors page)
/ko/index.html                               ← REBUILD (Korean equivalent)
/en/notebooks/index.html                     ← edit: remove shop, end with NaverShop CTA
/ko/notebooks/index.html                     ← edit: same
/en/workshops/index.html                     ← NEW
/ko/workshops/index.html                     ← NEW
/en/letters/index.html                       ← unchanged (already exists as Courrier)
/ko/letters/index.html                       ← unchanged
/en/shop/                                    ← DELETE
/ko/shop/                                    ← DELETE
/media/web/home-arrival/                     ← NEW directory
  ├ door-01-courrier.{mp4,webm,jpg}
  ├ door-02-notebooks.{mp4,webm,jpg}
  └ door-03-workshops.{mp4,webm,jpg}
```

---

## 11. Out of scope

- Do not redesign or restyle About, Essays, Materials, or Letters pages. They keep working as-is.
- Do not change the bilingual logic in the root `/index.html`.
- Do not introduce a CMS, framework, or build step. The site is hand-authored static HTML — keep it that way.
- Do not add analytics, tracking, or third-party scripts.
- Do not implement a Naver Shop API integration. The link is a plain external link to the storefront.

---

## 12. Acceptance criteria

A reviewer should be able to confirm each of the following in 5 minutes:

1. Visiting `/en/` on a clean browser shows the loading sequence then the three doors. Visiting again shows doors immediately.
2. Hovering each door changes the page background to a relevant video. Mouse-out returns to default.
3. Tabbing through the page focuses each door in turn and triggers the same preview.
4. The door 02 primary CTA opens the Naver Shop URL in a new tab with `rel="noopener"`.
5. The door 01 primary CTA jumps to the subscribe section of the existing Courrier page.
6. The language toggle in the top-right switches between `/en/` and `/ko/` and persists the choice.
7. On a 380px-wide viewport, doors stack vertically and backgrounds auto-cycle every 4s.
8. With `prefers-reduced-motion: reduce`, no video plays and the loading sequence is skipped.
9. With JavaScript disabled, the doors render with their default backgrounds and all links work. (Loading skipped, hover previews use poster images via CSS only — acceptable degradation.)
10. Lighthouse Performance ≥ 90 on mobile, Accessibility ≥ 95.

---

## 13. Reference

A working visual prototype was produced during exploration. Implementation should match its **structure and behavior**, not necessarily its exact code (the prototype lives in chat history, not in this repo). Key behaviors to reproduce: loading fade, door layout, hover-to-video, floating chrome, two-button action row.

Open questions for Jordan before kickoff:
- Final NaverShop URL.
- Korean copy for all door content and the loading line.
- Decision on whether `/en/shop/` URLs should 404 or 301-redirect to NaverShop.
- Workshops page: do you want a real form, a mailto link, or "by invitation, write to us" with an email address?
