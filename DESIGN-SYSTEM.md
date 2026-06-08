# Studio Monjo — Design System

Version 0.1 · Established May 2026 · Built using `design:design-system` (document + extend)

This document is the source of truth for every design decision on the Studio Monjo site. If a value or pattern isn't here, it shouldn't appear in production. Every page is built from these tokens and components.

---

## Principles

1. **The work is the brand.** Every page exists to make a hand-painted notebook or card legible to a buyer. Design choices that compete with the work are wrong.
2. **Restraint reveals quality.** Fewer colors, fewer type sizes, fewer components, more whitespace. Subtraction over addition.
3. **Consistency over variety.** Two well-used type sizes beat five clever ones. One panel position beats four.
4. **Warmth over austerity.** Pure white reads cold. Warm paper (#FBFAF7) reads like the actual paper of the cards.
5. **Motion serves narrative.** Animation exists to advance a story (the cinematic single-product mechanic) — never as decoration.

---

## Tokens

### Color

Five neutrals, one accent. The accent has one job: marking the action the visitor should take.

| Token | Value | Use | Contrast on `--paper` |
|---|---|---|---|
| `--paper` | `#FBFAF7` | Primary background everywhere. | — |
| `--paper-deep` | `#F2EFE8` | Secondary surfaces (also-row, image stages). | — |
| `--ink` | `#0E0D0B` | All primary text. | 19.5:1 (AAA) |
| `--ink-mid` | `#57544F` | Secondary text. | 7.6:1 (AAA) |
| `--ink-soft` | `#8E8A82` | Captions, eyebrows, decorative text. | 3.7:1 (AA for ≥14px only) |
| `--ink-faint` | `#BBB6AC` | Hairlines, dividers, the rare faint dot. | — |
| `--line` | `#E6E1D7` | Single-line dividers (one per page max). | — |
| `--vermilion` | `#B23A2A` | Action color. Used on **one element per page**: the primary CTA. | 5.5:1 (AA) |

**Accessibility rules.**
- `--ink-soft` may only be used at 14px or larger. For 11px eyebrows, use `--ink-mid`.
- `--vermilion` may only be used on the primary CTA per page. Not on progress indicators, not on hover states, not on highlights.
- Body text is always `--ink` on `--paper` or `--paper-deep`. No exceptions.

### Typography

Two faces on Latin, one on Hangul. Three sizes total.

**Faces.**

| Token | Value | Use |
|---|---|---|
| `--font-sans` | `'Inter Tight', 'Pretendard', system-ui, -apple-system, sans-serif` | Nav, body, metadata, captions, prices. The structural face. |
| `--font-italic` | `'Newsreader', Georgia, serif` (italic, weights 200/300 only) | Cinematic captions, pulled quotes, the rare moment of voice. |
| `--font-ko` | `'Nanum Myeongjo', serif` | Hangul wherever Newsreader appears in Latin. Pairs beat-for-beat. |

The fourth face is the **Monjo wordmark**, used as an image (`/media/logos/Monjo Logo Design-16.png`). It is the only display typography on the site. There is no other display face.

**Scale.** Three sizes, used always at one of two weights (400 sans, 500 sans, 200 italic, 300 italic). Anything outside this list is wrong.

| Token | Size | Family | Weight | Tracking | Line height | Use |
|---|---|---|---|---|---|---|
| `--type-eyebrow` | 11px | sans | 400 | 0.32em | 1.0 | Uppercase eyebrow labels, nav links, metadata |
| `--type-body` | 14px | sans | 400 | 0 | 1.65 | Body copy, prices, materials values |
| `--type-body-em` | 14px | sans | 500 | 0 | 1.65 | Secondary headlines, emphasis (rare) |
| `--type-voice` | clamp(26px, 3.4vw, 40px) | italic | 200 | -0.005em | 1.2 | Cinematic captions, pulled quotes |
| `--type-voice-ko` | clamp(18px, 2.4vw, 24px) | ko | 400 | 0 | 1.4 | Korean voice (paired with `--type-voice`) |
| `--type-display` | clamp(34px, 5vw, 48px) | italic | 300 | -0.012em | 1.1 | Reserve panel titles only |

**Korean rule.** When Newsreader Italic appears in Latin, Nanum Myeongjo at 0.6× the Latin size appears below or alongside in `--ink-mid` or `--ink-soft`. Never use Pretendard for cinematic captions; use it only for nav, body, metadata.

### Spacing

Geometric scale. Only these values appear in production CSS.

| Token | Value | Use |
|---|---|---|
| `--space-1` | 4px | Hairline gaps |
| `--space-2` | 8px | Inline element gaps |
| `--space-3` | 12px | Compact element gaps |
| `--space-4` | 16px | Standard gap |
| `--space-5` | 24px | Section internal gap |
| `--space-6` | 40px | Block separation |
| `--space-7` | 64px | Section separation |
| `--space-8` | 96px | Major section separation |
| `--space-9` | 144px | Page-level separation |

**Rule.** Vertical rhythm uses these tokens exclusively. No 22px, no 36px, no 56px. If a layout needs a value not in this scale, the layout is wrong.

### Layout

| Token | Value | Use |
|---|---|---|
| `--width-prose` | 580px | Body copy, beat captions, opening title |
| `--width-panel` | 480px | Cinematic story panels |
| `--width-form` | 480px | Reserve materials, signup |
| `--width-content` | 1200px | Editions index, also-row, footer |
| `--width-page` | 1400px | Hard maximum — content never exceeds this |
| `--gutter` | clamp(20px, 4vw, 40px) | Horizontal padding on all containers |
| `--nav-h` | 64px | Top nav height (also the desktop touch-target minimum) |

### Motion

Three durations, two easings. No exceptions.

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 200ms | Hover, focus, micro-feedback |
| `--dur-mid` | 600ms | Panel fade in/out, nav state change |
| `--dur-slow` | 1200ms | Hero entrance, story keyframe transitions |
| `--ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default — used for everything except story keyframes |
| `--ease-story` | `cubic-bezier(0.42, 0, 0.58, 1)` | The cinematic story rotation easing (smooth, deliberate) |

**Reduced motion.** Every animation must have a `@media (prefers-reduced-motion: reduce)` override that disables it or replaces with an instant state change. Non-negotiable.

### Borders & shadows

There is one line on the site: `1px solid var(--line)`. Used to separate the also-row from the page above and the footer from the content above. Nowhere else. No card borders, no input borders (because there are no input borders — borders go on the underside as a single hairline only), no decorative rules.

There is one shadow on the site: a drop-shadow on the featured notebook in the story stage:

```css
filter:
  drop-shadow(0 30px 50px rgba(14, 13, 11, 0.18))
  drop-shadow(0 6px 14px rgba(14, 13, 11, 0.10));
```

Nothing else casts a shadow.

### Imagery

| Rule | Spec |
|---|---|
| Aspect ratio for product cards | 4:5 portrait |
| Aspect ratio for editorial photos | natural (unmodified) |
| Treatment | natural light, no filters, no fake film grain |
| Background | studio backdrops fade to `--paper` via radial mask in the story stage |
| Alt text | required, descriptive (not "image of notebook" — "Lotus, No. 002, held in hand against soft gray studio backdrop") |
| File format | WebP with JPG fallback |
| Largest dimension | 2400px on the long edge |

---

## Components

### TopNav

Fixed top bar. Background transparent over the opening title; gains paper-blur on scroll past hero.

**Spec.**
- Height: `--nav-h` (64px)
- Padding: `0 var(--gutter)`
- Brand mark: `<img>` of Monjo wordmark, height 26px
- Links: `--type-eyebrow` color `--ink`
- Language switch: same scale, `--ink-mid` for inactive, `--ink` for active
- Background: `transparent` initially, becomes `rgba(251, 250, 247, 0.85)` with `backdrop-filter: blur(14px)` after 100px scroll

**States.**
| State | Visual | Behavior |
|---|---|---|
| Default | Transparent over hero | None |
| Solid (scrolled past hero) | Paper bg w/ blur | Transition `--dur-mid --ease` |
| Hover (link) | Opacity 0.55 | Transition `--dur-fast --ease` |

**Accessibility.**
- All links keyboard-focusable
- Each link has 44px+ touch target on mobile (`padding: 12px 0`, displayed in mobile drawer at full row width)
- Brand link has `aria-label="Monjo — home"`

### Brand (Wordmark)

The Monjo logotype. Image only (`/media/logos/Monjo Logo Design-16.png`).

| Context | Height |
|---|---|
| TopNav | 26px |
| Footer | 22px |
| Opening title | 56px |
| Marketing/social | 80–120px |

Never colored. Never on a background other than `--paper`, `--paper-deep`, or true black/dark photo. Never modified, never recolored, never paired with another mark.

### Panel (cinematic story text)

The text panel that appears at scroll milestones in the story stage.

**Spec.**
- Width: `--width-panel` (480px)
- Position: **always centered, below the notebook** (lower 25–30% of the viewport). Never alternates sides.
- Padding: `0 var(--gutter)`
- Pointer-events: none (text doesn't intercept scroll/click)
- Vertical structure: eyebrow (`--type-eyebrow`, `--ink-soft`) → headline (`--type-voice`, `--ink`) → optional body (`--type-body`, `--ink-mid`) → optional ko (`--type-voice-ko`, `--ink-soft`)

**States.**
| State | Visual | Behavior |
|---|---|---|
| Hidden | `opacity: 0; transform: translateY(--space-4)` | Default |
| Visible | `opacity: 1; transform: translateY(0)` | Triggered when scroll progress within milestone range |
| Transitioning | Interpolating | Transition `--dur-mid --ease` |

**Rule.** All panels use the same width, the same position, the same internal structure. Variation comes from content, not layout.

### StoryStage + Notebook

The sticky scroll-driven product showcase.

**Spec.**
- StoryStage: `position: sticky; top: 0; height: 100vh; perspective: 2000px; overflow: hidden`
- Story container: `height: 800vh` (eight viewport-heights of scroll for seven panels)
- Notebook image: centered absolutely, width `clamp(280px, 38vw, 540px)`
- Mask: `mask-image: radial-gradient(ellipse 55% 65% at center, black 60%, transparent 92%)` to fade studio backdrop into paper background
- Transform: scroll-driven via 9-keyframe interpolation (see Motion section below)

**Keyframes for the rotation story.**

| Progress | rx | ry | scale | tx (vw) | ty (vh) | Notes |
|---|---|---|---|---|---|---|
| 0.00 | 6 | -3 | 0.92 | 0 | 0 | Entrance pose |
| 0.10 | 0 | 0 | 1.00 | 0 | 0 | **HERO POSE — hold** |
| 0.20 | 0 | 0 | 1.00 | 0 | 0 | **(rest, panel 1 displays)** |
| 0.32 | -2 | 14 | 1.08 | -4 | 0 | Tilt right, slight zoom |
| 0.46 | 3 | -16 | 1.12 | 4 | 0 | Tilt left, slight zoom |
| 0.60 | -6 | 4 | 1.04 | 0 | 0 | Tilt forward |
| 0.74 | 0 | 0 | 1.00 | 0 | 0 | **Settle, hold** |
| 0.84 | 0 | 0 | 1.00 | 0 | 0 | **(rest, edition panel)** |
| 1.00 | 0 | 0 | 0.92 | 0 | 0 | Exit pose |

Maximum rotation: ±16°. Maximum scale: 1.12. The notebook should never feel like it's wobbling — small precise movements with rest points beat large continuous movements without them.

**Accessibility.**
- `prefers-reduced-motion`: disable all transforms, set notebook to hero pose, stack panels vertically, scroll normally
- The notebook image has descriptive alt text

### ProgressPips

Decorative scroll indicator on the right edge.

**Spec.**
- Position: `fixed; right: var(--gutter); top: 50%; transform: translateY(-50%)`
- Pip count: equals panel count (currently 7)
- Pip size: 5×5px, border-radius 50%
- Inactive color: `--ink-faint`
- Active color: **`--ink`** (NOT vermilion — vermilion is reserved for the CTA)
- Active scale: 1.6
- Hidden on mobile (`<800px`)

**Aria.** Wrapper has `aria-hidden="true"`. The pips are decorative; the panels themselves are the navigable structure.

### Reserve

The transactional panel after the story ends.

**Spec.**
- Section padding: `var(--space-9) var(--gutter)`
- Inner max-width: `--width-prose` (580px)
- Centered text alignment
- Vertical structure:
  1. Eyebrow ("Reserve") in `--ink-soft`
  2. Title in `--type-display`
  3. Korean title in `--font-ko`, `--ink-mid`, 22px
  4. Spec line in `--type-eyebrow` color `--ink-mid`
  5. **MaterialsGrid** (separate component)
  6. Price in `--type-body`, `--ink`
  7. CTA — the only `--vermilion` element on the page
  8. Ship note in `--type-eyebrow` color `--ink-soft`

### MaterialsGrid

Six-row grid of materials and their specs.

**Spec.**
- Grid: `grid-template-columns: 1fr 1fr; gap: 0 var(--space-7)` (desktop); `1fr` single column (mobile)
- Each row: `padding: var(--space-4) 0; border-top: 1px solid var(--line)`
- Label: `--type-eyebrow` color `--ink-soft`
- Value: italic Newsreader 14px color `--ink`, right-aligned

**Default rows.** Cover, Paper, Ink, Watercolour, Thread, Seal. (Specific values per product.)

### AlsoCard

Catalog item in the also-currently-in-the-studio row.

**Spec.**
- Image: 4:5 ratio, object-fit cover, background `--paper`
- Below image margin: `var(--space-5)`
- Name: `--type-voice` (smaller variant: 22px italic 300)
- Korean name: `--font-ko` 14px color `--ink-soft`
- Meta: `--type-eyebrow` color `--ink-soft`
- Price within meta: `--ink`, margin-left `var(--space-3)`

**States.**
| State | Visual |
|---|---|
| Default | Image at full opacity |
| Hover | Image opacity slightly raised, 1.02 scale, `--dur-mid --ease` |
| Sold out | Image opacity 0.6, "Edition closed" replaces stock count in italic Newsreader |

### Footer

**Spec.**
- Padding: `var(--space-7) var(--gutter) var(--space-6)`
- Background: `--paper`
- Top border: `1px solid var(--line)`
- Inner: `flex; justify-content: space-between` (wraps on mobile)
- Three groups: brand mark (left), studio line (center), text links (right)
- Studio line: `--type-eyebrow` color `--ink-soft`, format: `Studio Monjo · Seoul · 2026`
- Links: `--type-eyebrow` color `--ink-soft`, hover `--ink`

### Beat (quiet text break)

Between scenes, a quiet italic line provides a breath.

**Spec.**
- Padding: `18vh var(--gutter)`
- Inner max-width: `--width-prose`
- Centered alignment
- Eyebrow: `--type-eyebrow` color `--ink-soft`, margin-bottom `var(--space-5)`
- Body: `--type-voice` (without italic clamp variation)
- Optional Korean line in `--font-ko` 0.6× size, color `--ink-mid`

### OpeningTitle

The hero before the story begins.

**Spec.** (revised from v4)
- Height: 70vh (down from 100vh — get the visitor to the work faster)
- Brand mark: 56px height
- Eyebrow: `--type-eyebrow` color `--ink-soft`
- Title: `--type-voice`, max-width `--width-prose`, italic
- Scroll cue: 36px line + label, color `--ink-soft`
- All centered

---

## Patterns

### Pattern: Cinematic single-product page

The home page and the featured product page share this template. Only content differs.

```
TopNav
OpeningTitle (70vh) — brand mark + tagline
Story (800vh sticky) — sticky notebook + 7 Panels
Reserve — eyebrow → title → spec → MaterialsGrid → price → CTA
Also (3-up of AlsoCards)
Footer
```

### Pattern: Quiet catalog page

The editions index, sold archive, essays index. No story stage; quiet listings.

```
TopNav
PageEyebrow + section title
Vertical scroll: AlsoCard rows OR essay-list rows
Footer
```

### Pattern: Long-form prose

About page, individual essays, materials page.

```
TopNav
Optional single hero photo (no parallax)
Single column at --width-prose, body in --type-body
Beat lines between sections
Footer
```

---

## Accessibility (system-level)

These rules apply to every page; they're not optional per component.

| Rule | Target | Verification |
|---|---|---|
| Body text contrast | ≥ 4.5:1 (AA) | Body uses `--ink` on `--paper` (19.5:1) |
| Touch targets | ≥ 44px square | Nav links, CTAs, AlsoCards |
| Reduced motion | Honored on every animation | Every component spec includes a reduced-motion fallback |
| Keyboard navigation | Every interactive element reachable, visible focus ring | Focus rings: `outline: 2px solid var(--ink); outline-offset: 2px` |
| Image alt text | Descriptive, not generic | Required in every `<img>` |
| Skip-to-content link | Top of every page, visually hidden until focus | Standard `.skip-link` pattern |
| Color is never the sole indicator | Always paired with text or icon | E.g., sold-out also shows "Edition closed" text |
| Language attributes | `lang="ko"` on all hangul, `lang="en"` on the rest | Verified in markup |

---

## Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use only the 9 spacing tokens | Use 22px, 36px, 56px |
| Use only the 6 type tokens | Define a one-off headline size |
| Apply `--vermilion` to the primary CTA only | Apply vermilion to progress dots, hover states, badges |
| Mask studio backdrops in the story stage with radial gradient | Leave gray backdrops visible during rotation |
| Lock cinematic panels to centered-below position | Alternate panels between left, right, top, bottom |
| Provide reduced-motion fallback for every animation | Ship animations without the media query |
| Use hangul ko-fonts at 0.6× the Latin size | Set ko-fonts at the same size as the Latin headline |
| Use the Monjo wordmark image as the brand mark | Recreate the wordmark in CSS or substitute a different mark |
| Show the work first, brand second | Open with brand, defer the work |
| Add rest points to the cinematic rotation | Run continuous micro-motion across all 800vh |

---

## Open questions

Items that need a decision before this system reaches v1.0:

1. **Turntable photoshoot.** The cinematic rotation needs an isolated product. Options: (a) background-remove existing photos via Photoroom (5 min, 80% quality); (b) reshoot featured notebook on white seamless (half-day, 95% quality); (c) full turntable shoot at 5° increments for true frame-sequence rotation (full day per featured piece, 100% quality). Decision required before launch.
2. **Character name.** The dumpling figure in the cards needs a name. Mong (몽), Boon (분), Petit, or other.
3. **Newsreader vs Söhne.** Strategy v3 proposed Inter Tight + Newsreader for the cinematic voice. Söhne is more refined but costs ~$300 license. Decide based on launch budget.
4. **Logo Design-12 (icon-only ó) usage.** Currently unused in the system. Options: favicon, social avatar, wax seal sticker on packaging. Decide and document.
5. **Korean version.** All components designed bilingually; the `/ko/` URL tree applies the same system with `--font-ko` substituting for `--font-italic` in voice contexts. Mock once before launch.

---

## How this system gets used

When designing a new page or component:

1. Check this document. If a component for the need exists, use it.
2. If a token for the value exists, use it. Don't introduce new values.
3. If neither exists, run `design:design-system extend` to add the new component or token here BEFORE adding it to a mockup.
4. After every page is designed, run `design:design-critique` against this system to catch drift.

This is the discipline that prevents v1/v2/v3/v4 drift across future iterations.
