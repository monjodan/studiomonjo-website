# Studio Monjo — Redesign strategy, v2

The pure direction. Replaces the cream + vermilion strategy in v1.

---

## The principle, restated

The first version added warmth — cream paper, vermilion accent, serif body — to feel "luxurious." That decision was wrong. The paintings already contain warmth, color, brushwork, ink, the vermilion seal. A site that adds more of the same is competing with the work.

The right move is the opposite. The site is visually silent so the work is loud. Pure white wall. Dark object. Almost no signage. This is the Cistercian abbey, the rock garden, the MoMA collection page, the Donald Judd installation. The luxury is the willingness to leave space. The discipline is what costs money.

Call this direction *the wall*. The whole site is one long white wall. The paintings hang on it. The only thing the visitor reads is what is necessary to identify each piece and, eventually, to buy it.

---

## What changes from v1

| | v1 (cream) | v2 (wall) |
|---|---|---|
| Background | `#F7F3EC` warm paper | `#FFFFFF` pure white |
| Accent color | Vermilion `#A83227` | None |
| Serif | Cormorant Garamond, body + headline | None — or one quiet moment only |
| Sans | DM Sans, demoted to UI | Söhne / Inter Tight everywhere |
| Hangul | Pretendard + Nanum Myeongjo serif | Pretendard only |
| Brand mark | Vermilion dot + wordmark | Wordmark only |
| Image treatment | Cream backdrop, hover scale | Pure white, no animation |
| Tone | French gallery + Korean restraint | Museum collection page |

The v2 system is harder to design because it has nowhere to hide. Every choice is visible. Every spacing decision matters more. There is no decorative element to compensate for an off space. This is the cost of working at this tier of restraint.

---

## Color

There is no color in the brand. There is only paper and ink.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FFFFFF` | Everything. |
| `--paper-edge` | `#EEEEEE` | The single hairline that exists per page, if any. |
| `--ink` | `#0A0A0A` | All text. |
| `--ink-mid` | `#666666` | Secondary text — captions, dates, prices. |
| `--ink-soft` | `#999999` | The smallest type only. |

That's the entire palette. Five values. No accent. No warm tones. No off-whites that try to be sophisticated. Pure, like a sheet of fresh Iroful before any ink has touched it.

The paintings provide all the color the site needs. When a Lotus painting in vermilion ink sits on a true white background, the red is louder than it would ever be on cream. White makes color *more* alive, not less.

---

## Typography

One typeface. Used at three sizes. That is the entire system.

**The typeface.** Söhne (Klim Type) is the ideal — designed for Apple, used by Bloomberg, MUBI, M+ Hong Kong, every contemporary museum that takes itself seriously. If licensing is a barrier (Söhne is ~$300 for a small business), the free alternative is **Inter Tight** at weights 400 and 500. Inter Tight is essentially what Söhne would look like if Apple had open-sourced San Francisco — clean, neutral, faintly humanist, designed to disappear. Either choice works. Avoid Helvetica (too generic), Inter (too clearly "tech startup"), and any Google geometric sans like Poppins or Manrope (they have personality the brand doesn't want).

For Korean: **Pretendard**, weights 400 and 500. It is the Korean Söhne. Designed by Kil Hyun-pyo, free, used by every serious Korean editorial brand in 2026. It pairs with Inter Tight as if they were one family.

**Sizes.** Three only. Anything else is decoration.

| Element | Size | Weight |
|---|---|---|
| Wordmark / nav / labels / metadata | 11px | 400 |
| Body / product titles / prices | 14px | 400 (titles 500) |
| The rare moment of voice (an essay opening, a caption that becomes a sentence) | 22px | 400 |

That is it. No 32px headlines. No 64px hero text. The HOMEPAGE has no headline. The visitor sees the painting. The painting is the headline.

This will feel uncomfortable. It is supposed to.

**Letter-spacing.** Wordmark and labels: `0.32em`, uppercase. Body: `0`. Italic: never. Bold: 500 only, never 700. The brand has one weight visually, with subtle 500-weight emphasis where required (product titles, "Sold out" ticker).

---

## The single typographic exception, optional

If you want one moment of voice — a pulled quote on the home page, the opening line of an essay — set it in **GT Sectra Display Light** (or free fallback: **Newsreader from Google Fonts at weight 200**), one size up (22px, italic). This is the brand's only flourish. Used at most once per page, and on most pages, not used at all.

If choosing between "use the serif moment" and "skip it entirely," skip it. The discipline of all-sans is more valuable than the small moments of warmth a serif provides. Apple does not use a serif anywhere on apple.com, and it is not poorer for it.

---

## Image system

The image is the page. Everything else is a label.

**Photography rules.** Every product photo is shot the same way:

- Pure white seamless paper backdrop.
- One light source, soft, from the upper left.
- Camera dead-on (90-degree front view) for cover shots, dead-overhead (bird's eye) for detail shots, never any other angle.
- No props. Not a fountain pen, not a hand, not a leaf, not a coffee cup. The object alone.
- Cropped tight enough that the object fills 50–70% of the frame, surrounded by white.
- Shot at high resolution (3000px+ on the long edge) so it can be displayed at any size without softness.

This is more work than current photography. Studio Monjo will need a half-day shoot per edition. Budget for it. The shoot is the cost of the brand at this tier; the alternative is photographs that look fine on Instagram and dishonest on the website.

**Sizes on the site.**

- Home: one image, full-bleed, at 100vw × 100vh (or close to it, depending on aspect ratio of the work). The next painting requires scrolling.
- Editions index: each piece occupies its own viewport-height row. The visitor scrolls one at a time. No grid. No three-up.
- Product page: one image at 80% of viewport height, dead center, with 60–80px of margin all sides. Below it, in the lower 20%, the label.

Yes, this is more aggressive than v1. The first version showed three paintings in a row at decent size. The v2 says: one painting, full screen, then scroll. This is closer to a museum's online collection or to the Aman Tokyo image experience than to anything an e-commerce designer would suggest.

---

## Page-by-page

### Home

The hardest page to design at this tier, because the temptation is always to add a headline.

Resist.

The home page is, top to bottom:

1. **Top bar.** The wordmark "STUDIO MONJO" set in 11px tracking 0.32em, top-left. Top-right: "EDITIONS · WRITING · ABOUT · EN/한국어," each as plain text in the same 11px. No buttons. No mark. No dot. Total height of the bar: 64px. White background.
2. **The first painting.** Full screen, white bordered, centered. Below it in tiny type: "Lotus, No. 002 · 연꽃 · A6 notebook · 7 of 20 remaining." That single label is the only text on this screen. The visitor scrolls.
3. **The second painting.** Same treatment. Different work.
4. **The third painting.** Same treatment.
5. **One paragraph of text**, set centered, max-width 580px, with 240px of vertical margin above and below. It says, in three or four sentences, what Studio Monjo is. No headline above it. No flourish around it. Just the paragraph, in 14px Inter Tight, dark on white. Reading time: 20 seconds.
6. **The footer.** "Studio Monjo · Seoul · 2026" set 11px in the same tracking as everything else. That's it. No links. No language switcher repeated. No social icons. The nav handles all of it.

Total page weight: maybe 2MB across three optimized JPEGs. Total page text: under 100 words.

This is the most aggressive home page recommendation a designer can give. It will feel naked the first time you see it on your screen. After three days, every other site will feel busy.

### Editions

A list view of every available work. One per row, full-bleed, scroll to next.

Each row:
- The painting, large, centered on white, with substantial margin.
- Below the image, set 11px Inter Tight: `LOTUS, NO. 002 — 연꽃 — A6, 40 PAGES — 7 OF 20 — ₩65,000`. All on one line if it fits. If it doesn't fit on mobile, wrap to two lines, but never break the rhythm with multiple text blocks.
- Click anywhere on the row → product page.

Sold-out works are still on the page. Their image is shown at 60% opacity, and the line below them reads `LOTUS, NO. 001 — 연꽃 — A6 — EDITION CLOSED`. Visiting the editions page is a way of seeing the full body of work, not just what's currently for sale.

There is no filter, no sort, no search, no tags. The list is short enough not to need them.

### Product page

The cleanest of all the pages. It has three things, in this order, top to bottom, separated by white space:

1. **Lead image.** Full-width container, 80vh tall, white background, painting centered.
2. **Caption block.** A short label, set centered, max-width 480px:
   - Line 1: `LOTUS, NO. 002 — 연꽃` (small caps, 11px, tracking 0.32em)
   - Line 2: `A6 · 40 pages · Iroful 75gsm · Edition of 20 · Number 7 of 20` (14px Inter Tight, line-height 1.7, text-align center)
   - Line 3, in italic Newsreader 200, max-width 580px: "The plum branch on this copy sits a touch higher than usual; the seal is stamped slightly off-center, just below the blossom on the left."
3. **Three more images.** Each at the same 80vh size, stacked vertically, separated by 240px of white space. Detail of the painting. The hand-stitched binding. The seal. No captions visible — the order of the images IS the caption.
4. **Materials list.** Plain unstyled definition list, max-width 480px, centered. 14px Inter Tight. Six lines. Cover, paper, ink, watercolor, thread, seal. No headline above it.
5. **Price and reservation.** Centered. `₩65,000` in 14px, `Reserve →` underneath as a plain underlined link in 11px tracking 0.24em. The link goes to checkout. There is no quantity selector, no shipping calculator, no "you may also like."
6. **Footer.** Same as everywhere.

The whole product page is roughly 5 to 6 viewport heights of scrolling. Most of it is image and white space. The text, end to end, is under 80 words.

### About

One full-width photo of you working — shot from behind, hands and pen visible, no face. Below it, three short paragraphs in 14px Inter Tight. Centered, max-width 580px. Total page: under 200 words.

Optional: a small line of metadata at the bottom — `Studio in Seongsu, Seoul. Founded 2025.` In 11px.

That's the entire about page.

### Writing / Essays

A list view. Each essay = one line of text:

```
2026.04 — On letter-writing
2026.03 — On the materials
2026.02 — Beginnings
```

That's it. No descriptions, no images, no excerpts. Plain text, 14px, line-height 2.4 for vertical air. Click into an essay → essay page.

Essay page: title in 22px (the rare big-text moment, used here because the essay needs space to breathe). Date and category in 11px below the title. Then the essay body in 17px Newsreader (or Inter Tight if you prefer pure-sans), centered, max-width 640px. 30 lines per page max before scroll. No drop caps, no decorative rules, no share buttons, no related posts. At the very bottom: `STUDIO MONJO — 2026.04 — PREVIOUS · NEXT`.

### Materials

A single page. One column. Each material gets a paragraph. No headings, no bullets, no images. Just prose, 17px, max-width 640px. The page reads as one long quiet essay about why these specific materials. 800–1200 words total.

---

## What disappears entirely

Compared to v1 *and* the current site:

1. The vermilion accent. Anywhere. Always.
2. The Cormorant Garamond serif. Replaced by Inter Tight (or Söhne) everywhere except the optional one-serif-moment.
3. All hover effects on images. No scale-up, no fade, no transition on photos. Hover does nothing visually; the cursor changes to indicate the click area.
4. All decorative SVG elements. The vermilion dot in the logo, the small ornament rules, the colored hairlines. All of it.
5. Section dividers. White space IS the divider. There are no horizontal lines on any page.
6. CTA buttons in any color. Every link is plain underlined text. The "buy" link is a plain underlined link. The "subscribe" button is a plain underlined link.
7. The eyebrow labels above sections ("CURRENTLY IN THE STUDIO," "ABOUT THIS COPY"). Replaced by white space and trust in the visitor.
8. Image captions on hover. The image speaks for itself.
9. Animated transitions of any kind, including page-load fade-ins. The site is static. Pages render instantly, fully formed. This is closer to a printed catalog than to a website.

---

## What's added

1. A studio reshoot of every product on pure white seamless paper. This is non-negotiable for the v2 direction. Without good photography, this design fails. With good photography, it sings.
2. A `/sold/` archive page that shows every retired edition. Same treatment as `/editions/`, but everything is shown at 60% opacity with `EDITION CLOSED` underneath. This is the brand's growing body of work, the proof that the studio has been running for years.
3. A KakaoTalk + email row at the bottom of the home (optional — could also disappear entirely). If kept, it is one line of text: `Once a month: ` followed by a plain inline email field and a plain "Subscribe" link, all 14px. No box, no border, no background, no incentive.

---

## Why this is harder, and worth the difficulty

A site that looks like v1 is achievable in three weeks of careful work and is forgiving — if a section is slightly off, the warm tone covers for it. A site that looks like v2 requires every spacing decision, every type size, every photograph to be exactly right. There is nowhere to hide. The white background reveals everything.

The reward is significant. v2 is the kind of site that makes a Korean editor at a magazine like *Casa Brutus* or *Apartamento* email you to ask if she can write about the brand. v1 doesn't get that email. v2 does, because v2 looks like a site that already belongs in the magazine.

It also ages better. v1 has trends in it (warm cream is having a moment in 2024–2026; vermilion accents are everywhere right now). v2 has no trends in it. It looks the same in 2026 as it would in 1996 or 2046. The MoMA collection page has not changed in decades and will not need to.

---

## Sequencing

Same three-pass logic as v1 but fewer steps because there's less to design.

**Pass 1 (week 1).** Site-wide: replace the palette, swap the type to Inter Tight + Pretendard, remove the vermilion, remove all hover and animation effects, redo the home and editions pages.

**Pass 2 (week 2).** Photography reshoot. Half-day in the studio with a friend who can shoot, or a hired photographer for a few hundred thousand won. New product images for every current edition, on pure white. This pass is about the photos, not the code.

**Pass 3 (week 3).** Product page restructure with the new images. About, materials, essays pages. Final pass on every page for spacing, type sizing, and removal.

After v2 ships, sit with it for a month before changing anything. Resist the urge to add. The instinct will be strong. The brand at this tier is built by what you don't add.

---

## A closing note

Apple does not have a "luxury" mode. Apple has restraint, and the restraint reads as luxury. The product is allowed to be the only thing on the page because Apple trusts the product. Studio Monjo's products are good enough to deserve the same trust.

The hardest part of v2 is not the design. It's the willingness, every time you sit down to update the site, to take something out. If the v2 home page has more than three paintings, three lines of metadata, and one short paragraph of text, something is wrong. Subtraction is the practice.
