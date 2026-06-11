# Studio Monjo — Design & Brand Audit, June 2026

Independent, research-backed audit of studiomonjo.com (all three locales), the Naver detail-page HTML (`naver/monjo-line.html`, `naver/edition-001..003.html`), and the underlying design system. Prior audit documents in this repo (CRITIQUE-V4, REDESIGN-STRATEGY-*, etc.) were deliberately not read. Goal: a brand that is unique and differentiated, and that converts — weighted toward Korea/Naver revenue.

**Method.** Every page and stylesheet was read in full. Findings were checked against two commissioned research passes: (1) the premium/artisanal stationery landscape (Hobonichi, Traveler's Company/Midori, Moleskine, Leuchtturm1917, Papier, Smythson, Field Notes, Baron Fig, Korean independents, French houses), and (2) Korean e-commerce conventions (Naver 상세페이지 norms 2025–26, 필사/텍스트힙 and 만년필 trends, gift commerce, pricing benchmarks, French-brand cachet in Korea). All sources are listed at the end; unverified figures are flagged inline.

---

## 1. Executive summary

Studio Monjo sits on a genuinely rare brand position: **a French founder, hand-binding notebooks in Seoul, with a robot character who discovers the city, and a fountain-pen-grade paper system.** No competitor occupies this intersection. Japanese brands own paper engineering (Midori MD, Hobonichi/Tomoe River). Korean independents own either eco-minimalism (Trolls Paper, Analog Keeper) or maximalist character IP (Wiggle Wiggle). French houses own heritage and terroir (Clairefontaine, La Compagnie du Kraft) but are imports in Korea. A French maker *resident in Seoul*, selling through Naver with Korean CS and same-country shipping, is a story none of them can tell.

The problem is not the position — it's that the strongest assets are **buried, fragmented, or unmeasured**:

1. **The founder story (AI builder → bookbinder) is the single best brand asset and it does not exist on the website.** It appears only mid-page in Korean Naver HTML. There is no About page in any language. This story is precision-matched to Korea's 텍스트힙/필사 moment (handwriting as identity for 20–30s) and to how French brands win in Korea (Maison Kitsuné model: founder-led, story-led).
2. **Robey, the character, is invisible.** The Korean Naver pages call Robey "몬조단이 만든 작은 로봇" — a robot discovering Seoul — but the website never shows the character, tells its story, or archives its editions. Character IP is the most defensible moat in Korean stationery; you have one and don't deploy it.
3. **Naming is split across languages.** "Robey" (EN) vs "러비" (KO) is not a consistent romanization pair (러비 reads "Reobi/Luvvy"; "Robey" would back-transliterate as 로비). A Korean fan searching 러비 never finds Robey content, and vice versa. The maker is "Jordan Monnet" in English and the persona "몬조단" in Korean, with no bridge.
4. **Nothing is measured.** Zero analytics on the site (no GA4, no Naver Analytics), zero UTM parameters on the eight SmartStore links. Every design decision from here on is blind until this is fixed.
5. **The site sends traffic away and captures nothing.** The notebooks page exits to Naver eight times; there is no email list, no Kakao channel prompt, no 알림받기 ask — ironic for a "writing house" whose flagship product is a letter subscription.
6. **The home page hides the brand.** No product photography, the positioning line is hidden on mobile (≈75–80% of Korean traffic), and the English page's primary CTA is in French ("S'abonner").
7. **Real conversion levers on Naver are unused**: no review/찜 strategy, no gift (선물하기) framing, no production lead-time promise, no cross-edition links, hot-linked 5–8 MB GIFs.
8. **The visual system is good but split into four palettes** (global warm-white, notebooks/courrier cream, Monjo-Line gray, Robey terracotta) with the one ownable motif — colored binding thread as edition code, plus the red seal — underexploited.

The recommended brand platform (§7) codifies what already exists: **"La maison d'écriture de Séoul" — the French writing house of Seoul**, expressed through three ownable assets: the **thread code**, the **red seal**, and **Robey's Seoul**. The revenue roadmap (§8) sequences ~30 actions into P0/P1/P2.

---

## 2. Market context (what the research says)

**Premium stationery is a story business with a spec floor.** Every winning brand pairs one technical proof with one narrative engine: Hobonichi = Tomoe River paper + annual collectible ritual (900k+ units of the 2024 edition; 350+ items per launch); Traveler's Company = MD paper + "travel as a way of life" refill system; Moleskine = mid-grade paper + invented Hemingway heritage at $20–40; Field Notes = cheap memo books + quarterly never-reprinted editions (resale above $300); Smythson = Featherweight paper + royal warrants at $80–340. Studio Monjo's spec proof (FSC/ECF/acid-free, fountain-pen tested, hand-bound) is real; its narrative engine is present but unassembled.

**Scarcity is the small-maker revenue engine.** Field Notes' model — date editions, never reprint, sell subscriptions to the cadence — is the single most reliable mechanism by which small notebook makers create urgency, collectors, and a price halo. Studio Monjo's notebooks page explicitly disclaims this ("Story, not collectibility… the point is not scarcity"). That is a deliberate, defensible ethical stance, but it currently buys nothing in return: there is no other urgency mechanism in the funnel.

**Korea specifics.**
- Naver detail pages are "compressed commercial environments": one long vertical flow must do explanation, certification, social proof, price justification, and logistics. ~75–80% of traffic is mobile; baked-in text must survive 860→375px scaling. Since ~March 2025 Naver's ranking reportedly weights conversion signals (dwell, reviews, CTA placement) over clicks (blog-sourced; treat as directional). Review count, 찜 (wishlist) count, and 알림받기 (store follow) are read by shoppers as life signs; dead-looking numbers suppress conversion.
- The 필사/텍스트힙 trend is the demand wave: transcription-book titles +42% YoY (57→81, 2023→24), 20–30s were 53.8% of buyers of the viral Constitution-transcription book, and the fountain-pen communities (펜후드 ~18–38k members, 문방삼우 10k+) judge paper by ink behavior — Hobonichi's Korean reputation rests on exactly this.
- Gift commerce is enormous (Kakao 선물하기 ≈ ₩3.5T market; Naver runs its own gift agent since May 2026). Notebooks are a classic low-risk gift; Monjo's bilingual story card is a ready-made gift mechanic.
- "French" carries genuine premium signal in Korea (Maison Kitsuné's 신명품 trajectory; Papier Tigre stocked by Korean select shops and profiled by Kinfolk Korea). French *and locally made/shipped* is an unoccupied niche.
- Price corridor: imported premium notebooks/diaries cluster at ₩30,000–55,000 (Hobonichi low-₩50k, MD Codex ₩36k, basic MD ₩8–20k). Handmade + story justifies the upper half of that band. (Handmade price bands partially unverified — see sources.)
- Offline discovery runs through curated retail: Object (consignment, entry via md@insideobject.com), Point of View Seongsu, 10x10, 29CM, idus; Seongsu pop-ups are the discovery engine (774 pop-ups in Q1 2025, 3× YoY).

---

## 3. Brand audit

### 3.1 Positioning — right idea, wrong visibility
"French stationery house in Seoul / For the art of writing by hand" is a strong, true claim. But it renders as a 9px uppercase label + one italic line, absolutely positioned over door 2, and is `display:none` below 900px. The claim that should organize everything is, on most devices, not present at all. **Severity: high.**

### 3.2 Brand architecture — a house with unmarked rooms
The architecture is actually sound — Studio Monjo (house) → Robey in Seoul (story line) → Monjo Line (work line) → Courrier de Séoul (letter) → Workshops (table) — but nothing on the site explains it. There is no About page, no page that shows the house and its rooms together. The README articulates it better than the website does ("Studio Monjo is the house. Writing by hand is the center. Robey is one illustrated series inside that world."). That sentence belongs on the site, not in the repo. **Severity: high.**

### 3.3 Naming — three unresolved splits
1. **Robey / 러비.** Inconsistent romanization-transliteration pair (see §1.3). Pick one canonical pairing and use it everywhere — e.g. keep 러비 (it's warm and ownable in Korean) and spell it "Robey" only if you also print 러비 next to it on covers, cards, and web, treating the pair as a bilingual lockup. Searchability, hashtag accumulation (#러비노트), and eventual trademark filing all depend on this.
2. **Jordan Monnet / 몬조단.** The Korean persona 몬조단 ("the Monjo-dan") is charming and should be kept — but bridge it: the EN site should introduce the same persona ("Monjodan — what Korean customers call the founder") or the story fractures by language.
3. **"Robey in Seoul" vs "러비 노트" vs "Robey".** Line name, character name, and product name are used interchangeably. Fix the hierarchy: *Robey* (character) > *Robey in Seoul* (edition line) > *Edition 003 — Small Library* (product).
**Severity: high (compounds over time; cheap to fix now).**

### 3.4 The founder story — your best asset, unshipped
The Korean Naver pages contain the strongest paragraph in the entire brand: *fifteen years building and investing in AI companies in Europe and Asia, seven years running an AI company in Seoul, and the conclusion that handwriting is what keeps a person whole.* This is (a) verifiable, (b) emotionally precise, (c) perfectly aligned with the 텍스트힙 zeitgeist, and (d) a PR headline that writes itself in any language ("He builds AI by day. He binds notebooks by hand."). It appears nowhere on studiomonjo.com. The Courrier grandmother story (writing monthly to a grandmother in Paris who can no longer travel) is its emotional twin and is locked inside the French-only page. **Severity: critical for differentiation.**

### 3.5 The anti-scarcity stance — keep the ethics, add a mechanism
"The date grounds the edition; we may keep, pause, or retire it" is honest and brand-consistent. But research is unambiguous that edition dynamics are the small maker's main revenue lever. A compatible middle path: never promise reprints *or* destruction — instead publish a visible **line ledger** (available / paused / retired, with dates) and announce retirements 30 days ahead. Retirement-as-news creates the urgency moment without manufactured scarcity, and the ledger itself becomes collectible content. Field Notes built a 10M-unit business on the archive page alone. **Severity: medium, high upside.**

---

## 4. Visual identity audit

### 4.1 What works — keep and codify
- The **cream-paper identity** (`#faf6ed` family) on notebooks/courrier is distinctive, photographs well, and reads "paper object" instantly.
- The **red seal** `#b8231d` used as a small dot/wax-seal gesture is a genuinely ownable mark — currently used timidly (6–7px dots).
- The **thread code** — red thread for Edition 001, orange for 002, navy for 003, black for Monjo Line — is the single most original system in the brand. It is physical, photographable, bilingual by nature, and no competitor does it. It deserves to *be* the brand's color system: swatches, edition naming, packaging, even the website accent per edition.
- Photography and Korean alt text are far above category norm; `prefers-reduced-motion`, skip links, focus styles, `word-break: keep-all` all present.

### 4.2 Four palettes, one brand
Current state: global pages use warm-white `#fbf8f1` + pure white; notebooks/courrier use cream `#faf6ed`; the Monjo Line Naver page uses a cold gray-white system (`#f6f6f3`, accent `#5b5b56`); Robey Naver pages use warm cream with a terracotta accent (`#9a5139`). None of the Naver pages uses the red seal. Sub-brand differentiation is fine — but it should be expressed through the *thread color* and photography, on one shared paper-cream ground, with the seal red as the constant. One brand, one paper, many threads. **Severity: medium.**

### 4.3 Typography
- **Cormorant Garamond at 300 weight is too frail for its jobs.** At display sizes on cream it's elegant; at 13–19px (workshop steps, ledger values) the hairlines disappear, and it is also a ubiquitous free font — fine as body serif, weak as the brand's voice. The signature is already part of the product ritual (signed Courrier letters, signed workshop notebooks): commission a wordmark/lettering from the founder's own hand. That is unfakeable and free.
- **Microtype is below floor.** 9px (hero eyebrow), 10px (route labels, kickers), 11px (buttons, nav, footer) — much of it letterspaced uppercase in `#9a9a9a`/`#b3aca0` on white/cream, far below WCAG 1.4.3 contrast at those sizes. Korean uppercase-styled labels also do nothing (no case in Hangul) while the 0.08em tracking degrades 가독성. Floor: 12px Latin / 13px Korean, and lift label colors to ≥ `#6e6e6e`.
- **Korean font loading is inconsistent**: ko pages load Noto Sans/Serif KR from Google Fonts (good), but `assets/fonts/` ships seven unused TTFs (Nanum families, ~MBs of dead repo weight) and no `@font-face` exists anywhere. Delete or use them.

### 4.4 Buttons and CTAs
The beige primary (`#efe3d2` on cream with `#cdbba5` border) is nearly a no-contrast button — it reads *disabled* next to the ink-black `.btn-primary` used elsewhere. CTA labels are a mixed bag of verbs and languages on a single screen ("Read", "S'abonner", "Discover", "Naver Shop ↗", "See", "Request a seat"). Adopt one CTA grammar: primary = ink block button, always an action + object ("Subscribe to Courrier", "Shop on Naver", "Book a seat"). **Severity: high (this is the conversion surface).**

---

## 5. Website audit (page-level + technical)

### 5.1 Home (three doors)
- **No product photography on the home page of a craft brand.** The doors are typographically handsome but a first-time visitor sees zero evidence of the beautiful objects. Every benchmark brand leads with the object (Hobonichi, Papier, Smythson). Minimum fix: a muted photographic ground per door (notebook spine macro / blue floral envelope / workshop table) behind the existing type system.
- **EN page leaks French**: door 1's primary CTA is "S'abonner" on `lang="en"`. (KO is correctly localized to 구독하기.)
- **KO home advertises a French-only product**: door 1 sends Korean users to `/courrier/`, which has no Korean (or English) version. Either localize Courrier or label the door honestly (프랑스어 페이지) until it exists.
- Mobile: hero/positioning hidden <900px; door descriptions deleted <380px; each door compressed to ⅓ viewport. The brand statement should be the *first* thing on mobile, not the first casualty.
- The doors' hover-expansion grid (`:has()` + 1.18fr) is a nice desktop flourish; it has no mobile equivalent — consider a subtle thread-colored underline animation instead so the signature survives on touch.

### 5.2 Notebooks page — the best page, with five leaks
The maison-style page is genuinely good: clear two-line architecture, route strip ("Go straight to the reason you came"), paper-standards modal, honest 주문제작 framing. Five leaks:
1. **No prices.** Nothing on the entire site says what a notebook costs. Premium peers all display price; omission reads as incompleteness and adds a click of friction before Naver. Show ₩ ranges per line at minimum (also fixes the empty `offers` in the Product schema, which currently has currency but no `price` — Google treats it as incomplete).
2. **Eight exits, zero capture.** Every path ends at Naver. Add one capture moment — "Letters from the studio: one email when an edition arrives or retires" — before/alongside the final CTA. For a writing house, the newsletter *is* brand-consistent product.
3. **No social proof.** No review excerpts, no Instagram strip, no press. Even two photographed customer notes would materially help; research shows proof elements are load-bearing in Korean purchase decisions and increasingly in the West.
4. **Robey never appears.** The line is "illustrated Seoul stories" and the page shows covers at card-size only — never the character, never a scene close-up, never the story. One full-bleed illustrated scene with a story-card excerpt would carry the entire emotional argument.
5. **~12 MB of GIFs** (`robey-binding-thread-work-naver-small.gif` 5.5 MB, `robey-paper-ink-handling.gif` 6.2 MB, `folding-action.gif`) — on a page whose buyers are 75%+ mobile. Convert to `<video muted loop playsinline>` (H.264/WebM); expect ~90% size reduction and a large LCP/CLS win.
- Structural note: the page redefines `:root` tokens inline that `css/styles.css` selectors *depend on* (`--ink-warm`, `--rule`, etc. are used in styles.css but defined only in this page's `<style>`). Any future page reusing `body.notebooks` classes without the inline block silently breaks. Move the cream tokens into styles.css under a `.theme-paper` scope.

### 5.3 Workshops page
- **Booking via Instagram DM is the highest-friction checkout in the funnel** for a ₩150,000 product. Korean users expect Naver 예약 or at least a form; either embed Naver Booking (also boosts SmartStore ecosystem signals) or a simple form with date preferences. Keep IG as fallback.
- No upcoming dates, no past-workshop photos with participants, no testimonials. "Six seats at the Monjo table" is excellent copy begging for one photo of six occupied seats.
- Workshops are strategically undervalued: research shows craft studios monetize via private/corporate sessions and that workshop attendees become the highest-LTV customers and reviewers. Add a corporate/private line ("Team sessions for companies — notebooks stamped with your seal").
- `Course` schema with price/offers: good; keep.

### 5.4 Courrier page
- The hero, the grandmother story, the three-piece envelope explanation, the FAQ honesty ("Et si la personne n'aime pas ?") — this is the best storytelling in the brand. It is also **French-only**, while being advertised on the EN and KO homepages.
- Minimum: an English version (expat/diaspora gifting; "a letter from Seoul" sells extremely well in EN). Korea-domestic version is a P2 decision (shipping economics differ), but even a Korean-language *explainer* page would stop the KO-home dead-end.
- Pricing tiers are well-built (savings framing, cancel-anytime). PayPal-only is a known EU conversion limiter; consider Stripe later, not urgent.
- The hanji detail (mulberry paper, light-revealed grain) is a France×Korea bridge that belongs in the *global* brand story, not only here.

### 5.5 Technical / measurement / SEO / a11y
- **No analytics of any kind** (verified: no GA4, no Naver Analytics, no Plausible). **No UTM/n-source parameters** on any of the smartstore links. P0: add GA4 + Naver Analytics; tag every outbound Naver link (`utm_source=site&utm_medium=referral&utm_campaign=notebooks`); register the site in Naver Search Advisor.
- SEO hygiene is otherwise strong (hreflang trio, canonical, BreadcrumbList/Product/CollectionPage/Course schema, sitemap, og:* complete). Two gaps: Product schema lacks `price`; no FAQPage schema on workshop/courrier FAQs.
- Accessibility: good bones (skip links, focus-visible, reduced-motion, aria on lang pill, dialog usage). Gaps: paper-standards modal has no focus trap (Tab escapes into the page behind); microtype contrast failures (§4.3); door sections are `<section>` wrapping what is effectively one big link target but only buttons are focusable — acceptable, but ensure door hover states have visible focus parity (they do via `:focus-within` — keep).
- The trilingual static-HTML architecture (three hand-maintained trees) is already drifting (EN/FR CTA leak). Either add a build step with shared partials, or institute a release checklist per locale.

---

## 6. Naver detail pages audit (`naver/*.html`)

**What's right (keep):** long-scroll single-column at 860px; large baked-in type; `word-break: keep-all`; benefit-led section rhythm (기준 → 용도 → 만드는 사람 → 종이 → 선택 → 상품정보 → 추천); certification chips explained in plain Korean (FSC/무염소/무산성 — almost no small seller does this); honest 주문제작/색감 disclaimers; ink-behavior GIF (the #1 proof for the 만년필/필사 audience); the 추천 ("이런 분께") qualification list; Monjo Line's "비즈니스 선물" seeding.

**Gaps, in priority order:**
1. **No conversion furniture.** Research: converting pages combine trust + necessity + concision with explicit prompts. Missing: a top-of-page option/price summary block; a 리뷰 invitation ("첫 페이지 사진과 함께 리뷰를 남겨 주세요 — 다음 에디션 소식은 알림받기로"); an 알림받기/찜 prompt tied to edition retirements ("에디션은 예고 후 단종됩니다 — 알림받기를 켜 두세요" — this is the ethical-scarcity mechanism, §3.5, doing revenue work); a 선물 framing block (포장/스토리 카드 = 편지처럼 보내는 선물) given the ₩3.5T gift-commerce context and Naver's own gift agent.
2. **No production lead-time promise.** "주문 확인 후 손으로 제작" without a day count creates checkout hesitation. State it: "주문 후 N일 안에 묶어 보냅니다."
3. **No cross-links.** Edition 003 never mentions 001/002 or Monjo Line; Monjo Line never mentions Robey. One closing band: "다른 에디션 보기."
4. **Brand assets absent.** Neither template uses the seal red nor shows the thread code as a *system* (each page shows its own thread only). A small recurring footer band — 러비 in Seoul thread swatches + red seal + "서울에서 손으로 만듭니다" — would make every product page teach the brand.
5. **The founder block is strong but late and unillustrated.** Move a 3-line version (with the workbench photo) into the first third; keep the long version low. On Monjo Line, the AI-paradox is the *whole* purchase rationale for the target (사무실/회의) buyer — lead with it.
6. **Asset weight.** Pages hotlink studiomonjo.com images including the 6 MB ink GIF; Naver shoppers are on mobile. Serve compressed versions (<1.5 MB, or a short MP4 where the editor allows).
7. **Caption sizes**: 23px captions ≈ 10px effective at 375px — below comfortable; floor captions at 26px.
8. **Price anchoring.** 48 pages will be silently compared with Midori (₩8–36k, more pages) and Hobonichi (low ₩50k). Anchor on what they can't match: 한 권씩 손제본, 에디션 스토리 카드, 서울 제작·국내 배송, FSC 종이 — and consider naming the thinness as intent ("가볍게 들고 다니는 48쪽" already implied; make it explicit).

---

## 7. The brand platform (recommendation)

**Brand idea: La maison d'écriture de Séoul — the French writing house of Seoul.** Everything the brand does is "a French hand, a Seoul scene, a written page." Keep the existing line "For the art of writing by hand" as the functional tagline; add the founder paradox as the narrative hook (one sentence, everywhere: *"After fifteen years building AI companies, Jordan Monnet — 몬조단 — binds notebooks by hand in Seoul."*).

**Three ownable assets (codify, then repeat everywhere):**
1. **The thread code.** Each edition = a thread color, stitched by hand. Make it the visual identity system: edition pages keyed to thread color, swatch strip as brand graphic, thread-color packaging tie, "navy thread, story card included" as standard meta line (already half-done — finish it).
2. **The red seal (#b8231d).** Promote from decorative dot to actual mark: a stamped/printed seal on covers' inner page (already exists as 스탬프 — photograph it as the signature), on the site as the one constant accent, on Naver as the brand band.
3. **Robey's Seoul.** The robot who is learning Korea the way the founder did. Give Robey a page: the character, the premise, the edition archive (the ledger from §3.5), each with its scene, thread color, and status (available/paused/retired). This is the Hobonichi-style annual-ritual engine in miniature and the Korean character-IP play in one.

**Voice:** the site already writes beautifully ("A notebook should make you want to write before you know what to say"). Codify three rules visible in the best existing copy: short declaratives; objects over adjectives; one French phrase per page maximum, always translated by context.

**What NOT to do:** don't add a character mascot blitz (Wiggle Wiggle's lane), don't chase 다꾸 maximalism, don't fake heritage dates (Moleskine's trick is taken), don't discount — premium positioning in the ₩30–55k corridor depends on price integrity; use editions and gifting, not sales.

---

## 8. Revenue roadmap

### P0 — this month (measurement + leaks; mostly hours of work)
| # | Action | Why |
|---|--------|-----|
| 1 | Add GA4 + Naver Analytics; UTM-tag all SmartStore links; register Naver Search Advisor | Currently flying blind; everything else needs a baseline |
| 2 | Fix EN home "S'abonner" → "Subscribe"; resolve KO home → French-only Courrier dead-end | Trust leaks at the front door |
| 3 | Convert the three site GIFs to MP4/WebM (<1 MB); compress Naver-hotlinked media | Mobile LCP; 75%+ of buyers |
| 4 | Show prices (₩ band per line) on /notebooks/; add `price` to Product schema | Friction + schema completeness |
| 5 | Naver pages: add lead-time line, 선물 framing block, 리뷰/알림받기 prompts, cross-edition links, caption floor 26px | Direct conversion levers per Korean PDP research |
| 6 | Email capture on notebooks + courrier pages ("Letters from the studio") | Stop renting 100% of your audience from Naver/IG |
| 7 | Raise microtype floor (12px/13px) and label contrast site-wide; fix beige primary button to ink | Readability = conversion; a11y compliance |

### P1 — this quarter (brand assembly)
| # | Action | Why |
|---|--------|-----|
| 8 | **About/Story page** (EN/KO/FR): founder paradox, the house architecture, the hanji bridge, photo of the bench | The missing keystone page; PR landing surface |
| 9 | **Robey page + edition ledger** (available/paused/retired, retirement announced 30 days ahead) | Character IP + ethical scarcity mechanism |
| 10 | Resolve naming: canonical Robey↔러비 lockup; bridge Jordan Monnet↔몬조단; product-name hierarchy | Compounding searchability/trademark asset |
| 11 | Courrier in English (and KO explainer page) | Unlocks expat/diaspora gifting; fixes home-door dead-ends |
| 12 | Workshops: Naver 예약 (or form) + dates + testimonials + corporate/private offer | ₩150k product deserves a checkout; attendees = reviewers |
| 13 | Home: photographic grounds per door; positioning line visible on mobile; unified CTA grammar | First impression carries the brand |
| 14 | Consolidate palettes: one cream ground + thread-color accents + seal red, incl. Naver templates; move cream tokens into styles.css | One brand, one paper, many threads |
| 15 | Naver founder block: short version high, long version low; seed Monjo Line with the AI-paradox lede | The differentiator, placed where it converts |
| 16 | First retirement event for an edition (announce → 30 days → retire → archive) | Tests the urgency engine without betraying ethos |

### P2 — this year (distribution + compounding)
| # | Action | Why |
|---|--------|-----|
| 17 | Consignment/wholesale: Object (md@insideobject.com), Point of View, 10x10/29CM; idus for handmade audience | Korean design retail is the discovery layer |
| 18 | Seongsu pop-up or shared table (e.g., during a stationery fair) with workshop-on-site | Pop-up culture = press + content + reviews |
| 19 | Kakao 선물하기 listing for Robey editions (story card = built-in gift message) | ₩3.5T gift channel; product is pre-adapted |
| 20 | Editorial SEO: monthly "letter from Seoul" essay (EN/KO) + 필사 prompts using Robey scenes | Owns 텍스트힙 search demand; feeds newsletter |
| 21 | Fountain-pen community seeding: paper test kits to 펜후드/문방삼우 power users | The ink-behavior proof, delivered to the judges |
| 22 | Corporate gifting line: Monjo Line + custom seal stamp | High-margin B2B (Moleskine/Smythson's quiet engine) |
| 23 | Handwritten wordmark from the founder's hand; refresh mark lockup | Unfakeable identity asset (§4.3) |
| 24 | Consider Stripe alongside PayPal on Courrier; gift-first flow ("À offrir" path with recipient note) | Subscription conversion + gifting UX |

**Sequencing logic:** P0 stops the bleeding and starts measurement; P1 assembles the brand the assets already imply; P2 buys distribution only after the story and funnel can convert it.

---

## 9. What is already excellent (do not regress)
The cream-paper identity and photography; the courrier storytelling and FAQ honesty; the route strip and paper-standards modal on /notebooks/; certification plain-language explainers (site and Naver); Korean alt-text discipline; schema/hreflang hygiene; reduced-motion/skip-link/focus accessibility bones; the honest 주문제작 disclosures; the thread-color-per-edition idea itself. The brand does not need reinvention — it needs assembly, measurement, and volume on what is already true.

---

## 10. Sources

**Korean market / Naver conventions:** SellPage 상세페이지 size guide 2026 (sellpage.life/guide/smartstore-detail-page-size-guide-2026) · Gruuz SmartStore PDP guide (gruuz.com) · KoreaTechDesk, "Korea e-commerce product pages visual grammar" (May 2026) · Inquivix Naver SmartStore guide · Naver Shopping ranking FAQ (help.pay.naver.com/faq/content.help?faqId=10863) · 2025 상세페이지 최적화 가이드 (sidejob.omnibus-blog.com — *algorithm details unverified*) · 키위스냅 / jeongsung PDP strategy posts · YES24 다꾸 sales via iConsumer (idxno=14225) · 필사/텍스트힙 data: 뉴스저널리즘 (idxno=518693), 아시아타임즈 · 펜후드/문방삼우: 교수신문 (idxno=27829), 이데일리 · Kakao 선물하기 (kakaocorp.com/page/detail/11905), Naver 선물 에이전트 (Newspim, May 2026), Naver 선물하기 launch (네이트뉴스 2021) · SmartStore GMV Q1 2026 (CEO스코어데일리) · Maison Kitsuné in Korea: 한국경제 (2021), Economist Korea (2024) · French luxury in Korea: DBpia NODE08810875 · Papier Tigre in Korea: Kinfolk Korea, TACTO Studio, alkov · Point of View (pointofview.kr; Beyond Seoul) · Object (insideobject.com; 까이에 드 서울) · 10x10 (company.10x10.co.kr) · Seongsu pop-ups: Sweetspot data blog, openads (contsId=16067) · Hobonichi/Midori KRW pricing: 쇼핑하우, bestpen.kr, midori-yti.co.kr, Kyobo Hottracks · idus 주문제작 listings · Stationery market ₩8T: Goover report (*AI-aggregated; verify before quoting externally*).

**Brand landscape:** Hobonichi: JetPens guide (pt/900), PRNewswire 2025 lineup, 1101.com magazine/rankings, Bloomberg 2026-04-07 (*headline only; "1M copies" unverified*) · Traveler's Company: travelerscompanyusa.com/travelers-notebook-story, JetPens pt/726, Entropia · Moleskine strategy: Medium (linzihawkin), ReferralCandy, Content Marketing Institute · Leuchtturm vs Moleskine: Pageflutter, Square Lime Designs · Papier: Creative Review, Yahoo Finance UK, TechCrunch Series C · Smythson: smythson.com, Worn & Wound · Field Notes: Wikipedia, Slashdot (2025-06-17), fieldnotesbrand.com subscriptions, The Newsprint collecting guide · Baron Fig: baronfig.com history, Kickstarter · Korean indies: JetPens Korean brands (pt/983), fallindesign (o-check), trollspaper.com, oimu-seoul.com, wigglewiggle.global + The Momentum (*revenue figures unverified*), a-land/zeroperzero, Namuwiki 모트모트/위글위글 (*community-sourced*) · French houses: papiertigre.fr, Élysée boutique, lacompagniedukraft.com, clairefontaine.com heritage, Wikipedia Clairefontaine · Hand-bound economics: pegandawlbuilt.com, financialmodelexcel.com & classbento workshop guides (*generic model estimates*) · Market CAGRs: marketdataforecast.com, market.us (*directional only*).

*Audit produced 2026-06-11. Site state as of css v=brand-20260609-mobile2.*
