# Studio Monjo — Redesign strategy, v3

The cinematic single-piece direction. Replaces v1 (cream + vermilion) and v2 (museum-pure). Built on what's actually in the studio.

---

## What I learned looking at the work

The first two attempts failed because I was designing in the abstract — designing "luxury craft brand" generally rather than designing for *this* studio specifically. Once I looked at the photography folder and the logo files, three things became obvious.

**The Monjo wordmark is a serious mark.** It's a confident, sculptural logotype with a floating dot above the "ó" — that dot is the brand's signature gesture. It deserves to be shown at presence-size, not whispered at 11px.

**The character already exists.** The "small round figure" previous Claude was asking you to name is in `L1001446-2` and `L1001459` — a dumpling-shaped creature with rosy cheeks and tiny feet, hanging from painted branches. He doesn't need to be invented. He needs a name and a place on the site.

**The work is warm, not austere.** The studio shots show wooden trays, watercolour pans, ink pots, plants, fountain pens. The cards have humour in them — the bird on `L1001447` has an expression. The dumpling on `L1001446-2` is gentle and silly. A site designed for monastic restraint would amputate the personality that makes the work loveable.

The right design instinct for this brand is **cinematic presentation of warm work**. Apple-grade staging, but the staged object is a hand-painted card with a small character on it. The contrast between rigorous staging and tender content is what gives the brand its specific feeling — it is taking itself seriously, but it isn't taking itself too seriously.

---

## The model

Think of the homepage as a *short film about one piece*. Each season, you feature one card or one notebook. The visitor scrolls and the piece is revealed in stages: the studio, then the closed object, then the painting, then the small character, then the materials, then the page, and finally the price. By the time they reach the reserve link, they have spent maybe 90 seconds with this single object. They have looked at it the way they would look at a painting in a gallery — not the way they look at a product on Shopify.

Then, below the cinematic feature, a quiet "also currently in the studio" row shows the rest of the catalog. Click any of them → that piece becomes the cinematic feature on its own page. The home and product pages share the same template; they only differ in which piece is being told.

This is how Aesop's product pages work. It's how Hermès' Petit H pages work. It's how every fashion brand's seasonal lookbook works. Stationery brands almost never do it this way, which is why doing it this way is a defensible position.

---

## Brand identity

### The mark

You already have it. **Logo Design-16** (the wordmark with the floating dot over the o) is the primary brand mark. **Logo Design-12** (the lowercase "ó" with the floating dot, used as an icon) is the secondary brand mark — favicon, social avatar, wax-seal sticker, the tab on the back of every card sleeve.

The dot is the brand's signature gesture. It echoes through the site as a quiet motif:
- The active state on the scroll progress dots (right side of the parallax page)
- The bullet between metadata in product specs
- The "·" separator everywhere

The mark is set at confident sizes:
- Hero: 64–80px tall, white-on-image
- Top nav: 26–28px tall
- Footer: 22px tall
- Cards/business cards/wax seal: at any scale

The mark is always **black**, never colored, never on a colored background other than warm-paper white or full black. No vermilion treatment. No gold foil. The mark is enough on its own.

### Color

A warm-paper system, not pure white. v2's instinct was right that pure black-and-white serves the work, but pure white is too clinical for warm work. The right base is **warm paper** — ~96% lightness with a subtle yellow/cream cast that matches the actual paper of the cards. The work then sits on the page the way it sits on a desk in the studio.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FBFAF7` | Page background. Warm, slightly creamy. |
| `--paper-deep` | `#F2EFE8` | Section breaks, the "also" footer row. |
| `--ink` | `#0E0D0B` | Everything black. Slightly warm so it doesn't fight the paper. |
| `--ink-mid` | `#57544F` | Secondary text. |
| `--ink-soft` | `#8E8A82` | Captions and labels. |
| `--vermilion` | `#B23A2A` | Used at most twice per page: the active scroll dot, the "Reserve" link. |

The vermilion comes back, but at a much lower dosage than v1 — used only to mark the two genuinely active interactive elements (where you are, where to act). It isn't a decorative accent; it's the color of doing.

### Typography

Three faces, used precisely.

**Inter Tight** for nav, body, metadata, captions. The neutral structural face. Weights 400 and 500 only.

**Newsreader (Italic, weight 200–300)** for the cinematic captions and the pulled quotes. This is the brand's voice in italic — used only when the site is *speaking* poetically (scene captions, beat quotes between scenes, the hero tagline). Never for headings of pages, never for body copy. Used like a string section in a film score: rare, deliberate, when the visitor is meant to feel something.

**Nanum Myeongjo** for hangul, paired beat-for-beat with Newsreader. Same italic feeling in a different language.

That's the whole system. No Cormorant. No Söhne. No display sans. No decorative serifs. Three faces, each doing one thing.

### Voice

Small italic captions over photographs. Specific present-tense statements. The writing in the parallax mockup gives the cadence:

> "There is a small round figure, hanging from a branch."
>
> "He arrived in 2025, on a card I made for a friend, and refused to leave."
>
> "The page is the only thing I make that the buyer finishes."

Three sentences per scene. No descriptions of "exquisite craftsmanship." Specific facts — "painted in February in the studio in Seongsu" — over abstract claims. A small human voice.

---

## The parallax homepage in detail

The mockup at `/mockups/home-v3-parallax.html` demonstrates the structure. Breakdown of what's there and why.

**Hero — establishing.** The studio overhead shot (`L1001456`) covers the screen, slightly desaturated, with a darkening vignette. The Monjo wordmark sits at center, full size. Below it: "Studio Monjo · Seoul · Spring 2026" and one italic line: *"Hand-painted notebooks and letter cards, made one at a time. Currently in the studio: First Snow."* A "Scroll" cue at the bottom, with a thin dripping line. As the visitor scrolls, the image slowly scales up (Ken Burns) and the nav inverts from white-on-image to dark-on-paper.

**Beat — quiet text break.** A small italic line on warm paper: *"It begins as paper, ink, water, time."* Plus the hangul. This gives the page a breath between cinematic scenes and gives the visitor a moment to read.

**Scene A — the closed card on the desk.** `L1001446-2`, the photo where you're lifting a glassine sleeve to reveal the card. Sticky scene, full screen. Caption fades in: "First Snow, No. 001. There is a small round figure, hanging from a branch."

**Scene B — the character close-up.** `L1001459`, the macro of the dumpling on the painting. The visitor *meets* the character. Caption: "He arrived in 2025, on a card I made for a friend, and refused to leave."

**Beat — pulled essay quote.** Italic, on warm paper. *"To send a card by hand is to choose, against every faster option, the version of yourself that takes the time."*

**Scene C — the materials.** `L1001463-2`, the watercolour-pans-and-brushes overhead. Dark background, white text. Materials are named here, prosaically: "Iroful 75gsm. Platinum Pigment. Nevskaya Palitra. Vermilion ink, hand-stamped, last."

**Beat — the page.** *"A paper a fountain pen forgives."*

**Scene D — the inside spread.** `L1000120`, the painted spread. Caption: "The page is the only thing I make that the buyer finishes."

**Edition statement.** Pure paper background. A massive italic numeral: *7 / 20*. Below: "Edition of twenty · Hand-numbered · Painted February 2026 · Once they are gone, the painting is retired."

**Reserve.** Title, Korean title, full spec line, materials list as a clean two-column table, price small, "Reserve this copy →" in vermilion. This is where the transaction lives, after the entire cinematic prelude.

**Also in the studio.** A quiet 3-up grid of other current pieces. Click any → that piece's cinematic page.

**Footer.** Wordmark, "Studio Monjo · Seoul · 2026," basic links. Done.

Total scroll length: roughly 12 viewport-heights on desktop. Reading time: 60–90 seconds for someone who scrolls deliberately. The brand has spent a minute and a half making the case before asking for the sale.

---

## What this requires from the studio

**Photography reshoots are NOT required for v3 the way they were for v2.** The photos you have already work for this direction — they're warm, lived-in, full of context, exactly the texture v3 needs. The studio shots are perfect establishing material; the close-ups of the character are perfect character moments; the materials shot is perfect for the "the hand" scene.

What you'll want eventually: one new photo per featured piece per season. A hero shot of the new card or notebook on the desk, shot in the same warm style as the existing photos. That's it. Maybe four new photos a year, each taking 30 minutes to shoot.

**Naming the character.** This becomes important now because the parallax mockup features him. Some directions:
- **Mong (몽)** — Korean for dream, also the second syllable of *Monjo*. The brand's character is the dream half of the wordmark.
- **Boon (분)** — meaning *flour* or *powder* in Korean, fits the dumpling shape.
- **Petit** — a small-character French nickname, works phonetically in Korean.
- **Mochi (모찌)** — fits the visual but trends-adjacent in Korean food culture, possibly too cute.

I'd bias toward **Mong** because it ties into the brand wordmark phonetically and culturally, and because it has the right emotional register (dreamy, soft, slightly melancholic) for the character's expression. But this is your call.

**Naming the cards/editions.** The mockup uses placeholder names ("First Snow"). Each card needs a real name — short, evocative, in both English and Korean. This is two evenings of work; do it before launching the cinematic homepage.

---

## What it costs to build

A real implementation of v3 is more code than v1 or v2 because of the parallax. Estimated build:

- **Homepage parallax template**: 3 days. Sticky scenes, scroll-driven Ken Burns, overlay fades, mobile fallback (simpler, no parallax, just stacked scenes with fades).
- **Product page template** (same structure, just per-piece content): 1 day. The parallax homepage and the parallax product page are essentially the same template; only the content swaps.
- **Editions index, About, Writing, Materials**: 2 days. These are quiet pages that don't need parallax; they just need the v3 type and color tokens applied consistently.
- **Content authoring**: 4–6 hours per featured piece for caption writing, image cropping, sequencing. A real ongoing cost — every featured piece is a small editorial project.

Total first-build: about 7 working days for a competent front-end developer, or 2–3 weeks for you working evenings.

---

## What this direction is good and bad at

**Good.** Beautiful at desktop scale. Memorable for the visitor. Makes the brand feel like *Apartamento* or *Cereal* magazine more than an Etsy shop. Each season-feature becomes a marketing artifact you can share on social media (the homepage URL becomes a campaign asset). Press editors love this format. International buyers, who are not in Seoul and can't visit a shop, will respond especially well — the parallax substitutes for the experience of holding the object.

**Bad.** Mobile is harder to design well — parallax on phones is often choppy or skipped entirely. The plan is to fall back to a beautifully simple stacked version of the same content on mobile, with no parallax but the same cinematic photo treatment. Building this fallback well is half the work. Also: it's a higher-maintenance site because every featured piece is a small editorial production, not a SKU drop into a grid. If you don't have time for that production work, the homepage gets stale in a way the v1 grid wouldn't.

**The right call** is: ship v3 for the homepage and the *featured* product page (one per season). Use a simpler template (closer to v1 product page or v2 product page) for the rest of the catalog. This keeps the cinematic moment for the pieces that deserve it without forcing every page into the same format.

---

## A note on what changes from previous attempts

The previous documents are still on disk:
- `REDESIGN-STRATEGY.md` — v1, cream + vermilion, generic French-craft-luxury direction. **Wrong.**
- `REDESIGN-STRATEGY-V2.md` — v2, pure white museum, no color. **Closer to right but too cold for the work.**
- `REDESIGN-STRATEGY-V3.md` — v3, this document. **The actual direction.**

You can delete v1 and v2 if you want. They're not a path forward. They're a record of two wrong turns.
