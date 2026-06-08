# Studio Monjo — Redesign strategy

A direction for the website to match the corrected price tier (25K → 95K, with commissions to 350K). Written May 2026.

---

## The principle

The website is a small gallery, not a shop. Every choice should make a visitor feel they have walked into a quiet room with a few beautiful objects on a long table — not browsed a Shopify storefront. The visitor leaves wanting to come back, not wanting to add to cart.

Two cultures sit inside the brand. French restraint (small editions, classical serif, warm off-whites, generous margin, the seriousness of a rare-book dealer). Korean minimalism (controlled negative space, quiet hangul typography, the studio object treated as a self-sufficient image). The site lives at the intersection. It is not Japanese austere, not Parisian luxe-luxe, not Seoul-trendy. It is a French painter making things in Seoul, and the design has to feel that.

---

## What changes, in one paragraph

The white becomes cream. The serif goes everywhere prose lives. The hero image stops sharing the screen with text and runs full width. The navigation thins out and rises in letter-spacing until it almost disappears. Every page gains 30 to 50 percent more vertical air. Hangul gets a real serif partner. A single ornament — a small vermilion mark, the color of the chop on the lotus notebook — appears once per page, no more. Product images double in size. Prices move below the description, not next to it. Edition counts ("7 of 20") become a quiet design element. The shop button vanishes from the navigation; you reach the work by reading.

---

## Color

Drop pure white. Adopt a warm paper system.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F7F3EC` | Page background everywhere. Off-white with a hint of warmth, like uncoated stock. |
| `--paper-soft` | `#EFEAE0` | Section breaks, image backdrops, footer. |
| `--paper-edge` | `#E4DED2` | Hairlines and borders. Replaces `#ececec`. |
| `--ink` | `#1A1612` | Body and headings. Slightly warm black, not absolute. |
| `--ink-mid` | `#5A544C` | Secondary text. Warmer than current `#3a3a3a`. |
| `--ink-soft` | `#8B847A` | Captions, labels, eyebrows. |
| `--ink-faint` | `#B8B1A4` | Disabled, decoration. |
| `--vermilion` | `#A83227` | Single accent. Used at most three times per page (chop mark, edition count, key hyperlink underline). Echoes the seal you stamp on the lotus. |

The current `#c8261e` accent is a touch too bright — it reads digital. The proposed `#A83227` is dustier, more like an actual chop ink dried for a year. Use the vermilion sparingly. It is a punctuation mark, not a color scheme.

---

## Typography

Two type families on Latin, two on Hangul. Paired carefully.

**Latin display & body serif.** Keep `Cormorant Garamond` for headlines but shift the system. Currently it appears in titles only, light weight 300, large size. Move it everywhere prose appears — body copy, product descriptions, essays, the about page. Keep it at 18–20px for body, line height 1.7, weight 400 (not 300 for body, which gets too thin and reads as "stylish" in the bad way). Use the italic for the eyebrow above each product instead of all-caps DM Sans.

Why: Cormorant at body size is what a real art catalog uses. It's the difference between "this looks classy" and "this is classy." Most stationery brands chicken out and use a sans body because it's safer; Studio Monjo does not.

**Latin sans for UI only.** Keep `DM Sans` but demote it. Use it only for: the navigation, button labels, and the small data lines on product pages (size, pages, edition number). Drop letter-spacing on nav from `0.08em` to `0.18em` and weight from 400 to 300 — make it almost a whisper.

**Hangul.** Replace `Noto Sans KR` everywhere body copy appears with `Pretendard` (free, Korean-designed, the modern default for serious Korean editorial work in 2026). For headlines and the rare moments where hangul should feel "literary" (essay titles, the about page, the four-seasons set caption), use `Nanum Myeongjo` — a Korean serif that pairs warmly with Cormorant. The current site uses Nanum Myeongjo only as a fallback; promote it to first choice for headlines.

The pairing matters because most foreign brands in Korea fail one of two ways: they treat hangul as "the translation" (worse than the English) or they over-style it with calligraphic fonts that read as costume. Pretendard + Nanum Myeongjo, used at confident sizes, signals that the maker actually cares about Korean readers and hired well.

**Sizes.**

| Element | Size | Family | Weight |
|---|---|---|---|
| H1 (hero) | 64–80px | Cormorant Garamond | 300 |
| H2 (section) | 36–44px | Cormorant Garamond | 300 |
| H3 (product title) | 28px | Cormorant Garamond | 400 |
| Body | 18px | Cormorant / Pretendard | 400 |
| Long-form essay body | 19px | Cormorant / Pretendard | 400 |
| Caption / eyebrow | 11px | DM Sans / Pretendard | 400, tracking 0.22em |
| Price | 14px | DM Sans / Pretendard | 400, tracking 0.04em |

Note prices are SMALL, not big. Big prices read as e-commerce. Small prices, set in the same line as edition number, read as gallery wall labels. This is one of the highest-leverage changes on the entire site.

---

## Image system

The single biggest visual lever you have. The work is the brand. Show it bigger than feels comfortable.

**Hero image.** Currently splits 50/50 with text. Change to: full-width hero image at 100vw width and 80vh height, with the headline and one line of copy laid OVER the lower-left quadrant of the image in white. No CTA buttons in the hero. To shop, the visitor scrolls. This is a gallery move — the work first, language second.

**Product cards on the shop page.** Currently in a grid showing the painted object on a soft background. Increase image size by ~60%. Drop the card border. Use a 3-column grid on desktop, 1-column on mobile. Below each image: name in serif (Cormorant 22px), edition count in small DM Sans ("Edition of 20 · 7 remaining" in `--ink-soft`), price in same small DM Sans. No "View" button — the whole card is the link.

**Product page.** Lead with one large image, full-width-of-content (max 900px). Below it, a 2x2 grid of supporting photos at half width each, with no captions visible by default. Captions appear on hover only. The product information sits below all the imagery in a single narrow column (max 580px). This inverts the typical e-commerce pattern (image left, buy box right) and makes the page read as an article, not a transaction.

**Photography rules.** Always natural light. Always one of three surfaces: bare unbleached linen (for objects), pale wood (for studio shots), or hanji rice paper (for detail shots). Always one of two angles: directly overhead, or from a 30-degree forward angle. Never both in the same product set. Always a fountain pen, a hand, or both, in at least one image per product, for scale. No staged "lifestyle" with coffee cups.

**The negative-space discipline.** Around every image, leave at least 80px of paper on all sides at desktop, 32px on mobile. Most stationery sites pack images tightly — making your images the same size as everyone else's but with much more space around them is, paradoxically, what makes yours feel more valuable. The eye reads space as care.

---

## Page-by-page

### Home

Currently: split-hero with image left / text right, then footer. Almost no content.

Proposed:
1. **Full-width hero image** (the lotus, or the next signature painting). Headline overlaid lower-left in cream-on-image: "Art that follows the act of writing." No subheading, no buttons.
2. **Quiet introduction** — three short paragraphs of serif body copy, centered, max 580px wide, with 200px of margin above and below. No headline.
3. **Three featured editions** — the current standout pieces, shown large, with serif titles and small edition counts. Click → product page.
4. **A pulled quote from the latest essay**, set in italic Cormorant at 24px, with a small link below to read the full piece.
5. **The KakaoTalk + email signup row** — a single line, "One short letter per month. No promotions." with a clean inline email input. No popup, no incentive.
6. **Footer** — same as now but with more vertical air.

The home should feel like the cover of a thin book: an image, a sentence, an invitation. Nothing more.

### Notebooks (renamed: "Editions")

The category page. Currently has a hero, features strip, grid, process band, and FAQ. Trim to:
1. **Hero**: just an eyebrow ("Editions") and one sentence about edition logic. No buttons.
2. **The grid** of all current editions, organized by format (cards / Le Carnet / A6 / A5 / sets). Each format gets its own thin section header in small caps. Within each section, items are shown large in a 2 or 3 column layout depending on object size (cards smaller, A5 notebooks larger).
3. **Each item**: object photo, serif name (EN over KO in smaller size), edition status ("12 of 20 remaining" or "Sold out — next edition winter 2026"), price.
4. **A small note at the bottom**: "Each design is painted in a run of twenty, hand-numbered. When the twenty are gone, the design is retired." That's the entire features-strip and FAQ collapsed into one sentence.

Drop "the process" band from this page. Move it to About.

### Product page

Lead with image, follow with prose, end with action. The current template has the basics but is too tight and the price/buy button is too prominent.

Proposed structure, top to bottom:
1. **One large lead image** (max-width 900px, centered).
2. **Product name** (serif, 36px, EN above KO in 22px).
3. **Three lines of metadata**, set in small DM Sans, separated by middots: "A6 · 40 pages · Iroful 75gsm · Edition of 20."
4. **Three to four supporting images** in a 2×2 grid, half-width each, no captions visible, hover-to-reveal.
5. **A short paragraph of prose** in serif (the current `description_en`) — but rewritten to be tighter, in present tense, and to mention the specific painting on this specific copy when relevant.
6. **An "About this copy" line** — "This is number 7 of 20. The plum branch on this cover sits a touch higher; the seal is stamped slightly off-center." This is the bit that justifies the price. Each copy gets its own one-sentence note. (You can write these in 30 seconds per copy.)
7. **Materials list** — set as a small definition list, clean and unstyled. "Cover: Hahnemühle 230gsm · Paper: Iroful 75gsm, Sakae · Ink: Platinum Pigment Carbon · Thread: French waxed linen · Seal: vermilion, hand-stamped."
8. **Price + buy** — at the very bottom, set quietly. "₩65,000 · €43" in DM Sans 14px, with a single "Buy" link in vermilion underneath. The buy link goes to Toss/Stripe checkout. No "Add to cart," no quantity selector, no shipping calculator visible above the fold.

The order matters. Most e-commerce sites put price + buy at the top because they're optimizing for impulse. Studio Monjo puts price + buy at the bottom because it's optimizing for the right buyer. The wrong buyer leaves before reaching the price; the right buyer reads everything first and is committed by the time they see ₩65,000.

### Essays / Writing

Currently exists, light. Promote significantly.

Proposed:
1. **Index page**: list of essays with title (serif 28px), date (small caps DM Sans), and one-line description. No images on the index. The list reads like a contents page in a small literary magazine.
2. **Essay page**: a single column of serif body copy at 19px, max-width 640px, generous line height (1.85), with a small drop cap on the first paragraph. Hangul essays get the same treatment in Pretendard. No share buttons, no "related posts," no comment section. Just the essay, then a small line at the bottom: "Studio Monjo · [date] · [previous essay] · [next essay]".

Essays are the SEO engine, the brand-deepening engine, and the email-content engine. Write one a month and the site compounds.

### About

Currently very thin (one paragraph). Expand significantly without losing intimacy.

Proposed:
1. **A single landscape photo** at the top — back of head or hands at work, in the studio, natural light. Not a portrait.
2. **Three to four paragraphs of serif prose** about why you make these notebooks, your relationship to writing in Korean, the specific neighborhood of Seoul where the studio is, what a typical making day looks like.
3. **The materials list** — same as on product pages but with a sentence about each. Why Iroful. Why Platinum Pigment. Why French waxed linen.
4. **The character introduction** — once you name him, this is where he lives. A short paragraph, his name, why he exists, what he means.
5. **A small "press & retail" line at the bottom**: "Studio Monjo work has appeared at [Point of View, etc.] and been written about in [whichever publication first responds]." Empty for now; fills in over time.

### Materials

Keep but redesign as an essay rather than a spec sheet. Currently it lists materials. Should instead read as a short article called "On the materials." Each material gets one paragraph: where it comes from, why it was chosen, what it does for the work. Same paper-stock visual treatment as essay pages.

---

## What disappears

Things on the current site that should not survive the redesign:

1. **The "Shop" button in navigation.** Replace with "Editions." The word "shop" cheapens the brand at this price tier.
2. **The features strip on the notebooks page** ("Paper: fountain-pen ready" etc.). Move to About / Materials.
3. **All hero CTA buttons.** The hero is for the image. To take action, the visitor scrolls.
4. **The `class="btn btn-primary"` solid black buttons.** Replace with a single quiet button style: small caps, vermilion text, vermilion underline on hover, no fill. Used sparingly.
5. **Any "Sold out" red badges.** Replace with a small line of italic serif: "This edition is closed." Same information, different feeling.
6. **The FAQ section.** Move the one or two questions worth keeping to the About or Materials page, framed as paragraphs.

---

## What's added

1. **A vermilion chop mark** as a small SVG at the top-left of the page, replacing the current `monjo-mark-256.png`. The mark is the brand. Keep it small, ~24px, with the wordmark beside it at 12px tracking 0.18em.
2. **A "next edition" calendar** at the bottom of the editions page: "The next four-seasons set: 봄 · spring · April 2026." Builds anticipation and gives returning visitors a reason to come back.
3. **A character page** (once he's named): a single image, his name, three sentences about who he is. Unlinked from the main nav at first; lives at /character/.
4. **A "stockists" page** (when retail materializes): a clean list of where Studio Monjo is sold in person, with one photo per shop. Empty for now.

---

## Mobile

Most browsing happens on phones. The desktop design above translates with three rules:

- All padding values clamp downward by ~40%.
- Image grids collapse to single columns; images stay large.
- The serif headline scales down but stays serif. Don't switch to sans on mobile (a common compromise that breaks the brand).

---

## Voice

A reminder, since copy and design are inseparable at this tier.

Avoid: "exquisite," "artisanal," "lovingly crafted," "meticulous," "passion." Avoid superlatives. Avoid emojis. Avoid exclamation marks anywhere on the site.

Use: factual, present-tense, slightly-spare prose. Short declarative sentences. Specifics over abstractions ("painted in February" beats "painted with care"). Materials by their proper names ("Iroful from Sakae" beats "premium fountain-pen paper"). Direct first person ("I painted this" beats "this was painted").

The copy on the current site is already mostly this. Hold the line.

---

## Sequencing

If you do this all at once it's a 2-3 week build. Ship in three passes instead.

**Pass 1 (week 1).** Color tokens, typography sizes, hero treatment on home page. This is 80% of the visual lift for 20% of the work.

**Pass 2 (week 2).** Product page restructure, photo treatment, removal of e-commerce cues. This is what justifies the prices.

**Pass 3 (week 3-4).** Essays page redesign, about page expansion, materials page rewrite. This is what makes the site rewarding to return to.

After each pass, sit with it for two days before the next. Send the URL to two trusted friends who buy at this price tier (a designer, a writer) and ask one question: "What do you think this brand charges?" The answer should rise from "₩30,000" to "₩60,000" to "₩90,000" across the three passes. If it doesn't, something is off.

---

## The mockups

Two HTML mockups accompany this strategy, in `/mockups/`:

- `home.html` — the redesigned homepage, full-width hero with overlaid text, quiet introduction, featured editions row, essay pull-quote.
- `product.html` — the redesigned product page for the Lotus A6 notebook, image-led, prose-driven, price set quietly at the bottom.

Open them in a browser at full width (1400px+) to see them as intended. They use placeholder text where real copy isn't ready and stand-in image sizes; the layout, typography, and tone are the takeaways.

---

## A closing note

The single most expensive design choice you can make is to under-design. A site that tries to look "luxury" with serif headlines and gold accents but still has an "Add to Cart" button in red and product images surrounded by sidebar widgets reads as expensive trying to be cheap, which is the worst tier of all. The site that works at ₩95,000 is the one that has the courage to remove things. Most of the work in this redesign is removal.

If you keep one principle from this document: **when in doubt, take something out.**
