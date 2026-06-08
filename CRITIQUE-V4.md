# Design Critique: home-v4-single.html

Conducted using the `design:design-critique` framework. Stage: refinement (third iteration of the homepage direction). Brand context: Studio Monjo, hand-painted notebook studio, redesigning to support 25K–95K KRW price tier. The mechanic Jordan asked for: one notebook stays anchored on screen as the visitor scrolls, transforming via 3D rotation/scale, with text panels appearing around it. Apple iPhone product page model.

---

## Overall Impression

The mechanic is structurally correct — one sticky notebook, scroll-driven transforms, text panels around it. The execution is held back by three problems, in order of severity: (1) the photo isn't isolated so rotation reads as "tilting picture" not "rotating object"; (2) text panels alternate sides arbitrarily, producing visual jitter rather than rhythm; (3) the notebook is in constant micro-motion with no rest points, which prevents the visitor from settling into any single moment. Fixed in that order, this becomes the right direction.

---

## Usability

| Finding | Severity | Recommendation |
|---|---|---|
| Story is 8 viewport-heights long with no skip-to-buy | 🟡 Moderate | Add a quiet "Reserve →" anchor link in the top nav that becomes visible after the opening section |
| "Continue ↓" message in panel 7 breaks the cinematic spell at the transition | 🟡 Moderate | Drop the message; let the notebook fade gracefully and the reserve panel rise into view |
| Touch targets in nav are ~28px tall on mobile (under 44px WCAG minimum) | 🔴 Critical | Increase mobile nav-link padding to hit 44px |
| Reduced-motion preference is not honored — full rotation plays for users who request reduced motion | 🔴 Critical | Add `@media (prefers-reduced-motion: reduce)` that disables transforms and shows the panels in stacked sequence |
| No clear interaction affordance on "Also currently in the studio" cards | 🟢 Minor | Add a subtle hover state (image lift, or underline on the name) |

---

## Visual Hierarchy

**What draws the eye first on the opening screen:** the Monjo wordmark. **Is this correct?** Partially. For a craft brand, the very first visual moment should hint at the *work*, not the brand alone. Apple shows the iPhone immediately; the wordmark is small in the nav. The opening screen here is brand-first, work-deferred. Reconsider whether the opening should have a small establishing image of the notebook in the corner, or whether the story should begin immediately on first scroll without a separate opening section.

**Reading flow during the story:** broken. Panels position alternates top → right → left → right → left → bottom → bottom. The eye has no rhythm — it has to relocate every milestone. Apple keeps text in one consistent place (usually below or right) so the visitor's gaze stays anchored.

**Emphasis:** the headline italic in Newsreader 200 reads with the right authority. The eyebrow uppercase tracking-0.36em is good. The body copy at 14px is appropriately quiet. But the "7 / 20" panel at scroll 0.78–0.90 introduces a typographic moment at clamp(34px, 6vw, 64px) that's stylistically different from every other panel. It's not wrong, but it's a sudden shift in voice — like a film score transitioning from chamber music to a single struck cymbal. If the goal is restrained, this moment is too loud.

---

## Consistency

| Element | Issue | Recommendation |
|---|---|---|
| Headline sizes vary per panel: clamp(22, 2.6vw, 30) and clamp(26, 3.4vw, 40) and clamp(34, 6vw, 64) | One consistent headline scale across all panels — pick clamp(26, 3.2vw, 36) and apply everywhere | |
| Panel widths vary: 320px (left/right), 620px (top/bottom) | Establish a fixed panel width (e.g., 480px) and a single position (centered below the notebook) | |
| Vermilion appears 3 times per page (progress pip, "/" in 7/20, reserve CTA) | Strategy v3 said max 2 — drop vermilion from progress pips (use ink-mid) and from the slash (use ink-faint) | |
| Notebook drop-shadow filter changes with every transform | Lock a single drop-shadow value and let only the transform vary — the shadow should suggest depth, not animate | |
| Spacing between scroll milestones inconsistent: 0–0.13, 0.16–0.28, 0.32–0.44... gaps vary from 0.03 to 0.04 | Establish equal-length milestones with explicit rest periods between them | |

The deeper consistency problem: there is no underlying design system. I have been making per-panel decisions rather than working from a token sheet. Next session should invoke `design:design-system` to formalize tokens (colors, type scale, spacing scale, motion timing) before iterating on pages.

---

## Accessibility

| Check | Status | Notes |
|---|---|---|
| Body text contrast (--ink on --paper) | ✅ Pass | #0E0D0B on #FBFAF7 ≈ 19.5:1, exceeds AAA |
| Eyebrow text (--ink-soft on --paper) | ⚠️ Borderline | #8E8A82 on #FBFAF7 ≈ 3.7:1 — passes AA for 14px+ but fails for 11px caps |
| Reserve CTA on warm paper | ✅ Pass | Vermilion #B23A2A on #FBFAF7 ≈ 5.5:1 |
| Progress pips visible to keyboard users | ⚠️ Decorative only | Marked aria-hidden which is correct |
| Reduced motion respected | ❌ Fail | No media query — transforms always play |
| Touch targets on mobile nav | ❌ Fail | ~28px tall, needs 44px |
| Keyboard navigation through panels | ✅ Acceptable | Panels are pointer-events: none, content visible to screen readers but not focusable |
| Image alt text | ✅ Present | All `<img>` tags have descriptive alt |
| Color used as sole indicator | ✅ Acceptable | Active panel has fade animation in addition to color |

**Two critical accessibility fixes needed:** reduced-motion fallback and mobile touch targets. These aren't aesthetic preferences — WCAG 2.1 AA compliance requires both.

---

## What Works Well

- The single-sticky-notebook mechanic is the right structural decision. It's the difference between v3 (slideshow) and v4 (single product), and it's correct.
- Use of your actual Monjo wordmark at hero scale (56px) and nav scale (26px) gives the brand presence without overdoing it.
- The progress pips on the right side echo the floating dot in the wordmark — a quiet motif that ties the page together.
- The reserve panel structure (eyebrow → italic title → Korean → spec line → materials grid → price → CTA → ship note) is well-paced and museum-label appropriate.
- The "Also currently in the studio" footer-row pattern is the right way to handle the rest of the catalog without diluting the cinematic feature.
- Warm-paper background (#FBFAF7) instead of pure white solves the "too cold" problem from v2 without bringing in v1's competing decoration.
- Newsreader Italic 200 is the right voice for the cinematic captions — neither generic-sans nor over-styled-classical-serif. It sounds like the brand.

---

## Priority Recommendations

### 1. Isolate the notebook image (highest impact)

**Why.** The Apple effect requires the product to rotate against an unchanging background. Currently the lotus notebook photo includes a soft gray studio backdrop. When the image tilts at rotateY(22deg), the backdrop tilts too, breaking the illusion.

**How.**
- Five-minute version: run `media/web/notebooks/L1001423.jpg` through Photoroom or remove.bg to get a transparent PNG. Save as `media/web/notebooks/L1001423-isolated.png`. Update mockup to use it.
- Half-day version: reshoot the lotus notebook (and Birds & Berries, and one card) on pure white seamless paper with single soft light. New photos go to `media/photography/featured/`.
- Full version: turntable shoot of the featured notebook each season — 60–72 frames at 5° increments, scroll-scrubbed as a frame sequence.

The mockup as written supports all three. Only the asset changes.

### 2. Lock text panels to one position

**Why.** Panels currently alternate between top, left, right, and bottom. The visitor's eye relocates at every milestone. Apple keeps text in one place (usually right side, sometimes below) for the entire story.

**How.** Pick one of two patterns:
- **Pattern A (centered below):** all panels appear below the notebook, centered, max-width 480px. Notebook sits in upper 2/3 of viewport, panel in lower 1/3. Best for symmetric storytelling.
- **Pattern B (right side):** notebook sits left-of-center, panels appear right of it. Best for asymmetric editorial feeling. Used by Apple's Vision Pro page.

I recommend Pattern A for this brand because the work itself is centered (paintings on cards), and the symmetry reinforces the meditative feeling.

### 3. Add rest points to the rotation

**Why.** The notebook is in constant micro-motion across all 800vh of story scroll. There's no moment to settle. Pacing requires stillness.

**How.** Re-author keyframes so the notebook holds position at p=0.10–0.18 (square to camera, hero pose) and p=0.78–0.90 (square again, edition statement). Inside those holds, the notebook does NOT transform — only the text panels change. This creates two "rest beats" that frame the four "movement beats."

Updated keyframes:
```
0.00 → entering, slight tilt (rx 8, ry -4, s 0.92)
0.10 → SQUARE, hero pose (rx 0, ry 0, s 1.00) — HOLD until 0.18
0.18 → square (rx 0, ry 0, s 1.00)
0.30 → tilt right, zoom for cover detail (rx -2, ry 18, s 1.10)
0.45 → tilt left, zoom for seal detail (rx 4, ry -22, s 1.18)
0.60 → tilt forward, binding (rx -8, ry 6, s 1.06)
0.78 → SQUARE, edition pose (rx 0, ry 0, s 1.00) — HOLD until 0.90
0.90 → square (rx 0, ry 0, s 1.00)
1.00 → settling, fade (rx 0, ry 0, s 0.92)
```

### 4. Establish a real design system

**Why.** Per-panel typographic decisions are why consistency is uneven. A token sheet would have prevented this.

**How.** Next session, invoke `design:design-system` to formalize:
- Color tokens (already roughly defined in CSS but not documented)
- Type scale (3 sizes × 2 weights, not the current freelance scale)
- Spacing scale (8/16/24/40/64/96)
- Motion tokens (durations, easings, the keyframe set above)
- Component spec (panel, reserve materials grid, also-card, progress pip)

Save as `DESIGN-SYSTEM.md` and reference from mockup CSS.

### 5. Drop vermilion to one usage

Strategy v3 said vermilion appears at most twice per page. v4 has it three times: progress pip, "/" slash, reserve CTA. Change progress pip to `--ink` (active state goes from soft to full ink), change slash to `--ink-faint`. Vermilion stays on the reserve link only — the color of *doing*.

### 6. Move the opening section into the story

The current opening is brand-only (wordmark, eyebrow, italic tagline). Replace with the notebook in its hero pose, the wordmark moved to its small nav home, and the tagline/eyebrow folded into the first text panel. This eliminates one viewport-height of "brand intro" and gets the visitor to the work faster.

### 7. Build the mobile experience properly

Mobile currently hides left/right panels and shrinks the notebook. It needs a real design: stacked scenes where the notebook stays anchored at top of each scene (or sticky at top), text below, scrolling between them. Same content, different mechanic. Smaller rotations (max 8°) so they don't make people seasick on phones.

### 8. Add reduced-motion fallback

```css
@media (prefers-reduced-motion: reduce) {
  .notebook { transition: none !important; transform: translate(-50%, -50%) !important; }
  .story { height: auto; }
  .story-stage { position: static; height: auto; }
  .panel { position: static; opacity: 1; transform: none; pointer-events: auto;
           padding: 64px 24px; max-width: 580px; margin: 0 auto; }
}
```

This delivers a stacked-scenes version of the same content for users who prefer reduced motion or who are on devices where parallax stutters.

---

## Verdict

v4 is the right direction with three execution gaps. Fix in this order:

1. Background-remove the notebook image (5 min, immediate visual win).
2. Lock panels to centered-below position (15 min, fixes reading rhythm).
3. Re-author keyframes with two rest points (30 min, fixes pacing).
4. Add reduced-motion + mobile touch fixes (1 hour, accessibility compliance).
5. Run `design:design-system` next session to formalize tokens and prevent further drift.

After steps 1–4, this should be a defensible launch candidate for the homepage. After step 5, a defensible launch candidate for the whole site.
