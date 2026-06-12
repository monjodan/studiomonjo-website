# Naver Listing System 2026

Purpose: define the Naver SmartStore catalog from scratch — product naming, categories, tags, thumbnails, detail page architecture, packs, and launch sequence — for Monjo A5, Monjo Pocket (A6), Robey A5 per edition, Robey Pocket (A6), and pocket multi-packs.

Built on verified research (June 2026): Naver DataLab category keyword ranks (Dec 2025, Mar 2026, May 2026), live Naver autocomplete, the official 상품명/대표이미지 guidelines, verbatim competitor titles, and Korean seller community conversion practice. Every load-bearing claim below survived an adversarial verification pass.

---

## 1. The facts that drive everything

1. **The laptop trap is worse than expected.** 노트 alone, 업무용 노트, and 글쓰기 노트 all autocomplete to laptops. 노트 only works inside compounds (만년필 노트, 무지노트, A5 노트). 저널 means journalism. 메모북 autocorrects to a coffee grinder brand. 핸드메이드 노트 is buried under a handmade-coat clothing brand.
2. **Naver itself splits the category: 노트 vs 수첩.** Official paths: 생활/건강 > 문구/사무용품 > 노트/수첩 > **노트 (cid 50003556)** for A5 and > **수첩 (cid 50003559)** for A6. Category match is one of only four 적합도 ranking fields, and a wrong category can zero out exposure. This settles the A5/A6 split: they are different products to Naver's search engine. Never use 다이어리/플래너 (dated-planner intent, Q4 war).
3. **필사 is the growth keyword of this market.** 필사노트 is top-10 in the entire 노트/수첩 category year-round, riding the 텍스트힙 → 라이팅힙 trend (필사 book sales +64.7% YoY at Yes24; 교보 +692.8%; 29CM 노트류 +43%). 만년필노트 is mid-tail (#56) with purchase-grade autocomplete that literally includes our specs: 만년필 노트 a5, 만년필 노트 무지, 만년필 노트 세트. The compound 만년필 필사노트 is already productized (Wearingeul precedent).
4. **포켓노트 is the right A6 word.** 포켓노트 (#32 overall) has quality-skewed intent (Moleskine, leather covers, 무지). 미니수첩 has more volume (#14) but skews 다이소/bulk/700원. 포켓수첩 (#52) and 휴대용수첩 are secondary. Jordan's instinct ("pocket notebook") matches the data exactly — in Korean it is 포켓 노트, never 포켓 노트북.
5. **손제본 노트 is an empty niche.** 187 Danawa results, zero actual hand-sewn notebooks — all binder rings and glue pads. Micro search volume, but page one is free. 실제본 is the established premium vocabulary (Clairefontaine titles: 클레르퐁텐 트라이엄프 실제본 노트 A5). Use 실제본 in titles, 손제본/사철제본 in tags and page copy.
6. **Black-background thumbnails are legal and right.** The official 2024-10-28 대표이미지 rules prohibit text overlay, price/shipping info, borders and badges (sanction: delisting) — but say nothing against dark backgrounds. The documented failure mode is white-on-white (our current heroes), and the documented CTR lever is differentiation from competitor white-cutout rows. Clicks feed the 7-day 인기도 signal.
7. **Since March 2025, Naver ranks by conversion rate and dwell time, not just clicks.** The detail page is now a ranking factor through behavior. Long pages win when every scroll answers an objection (top seller cases run 59,000–142,000px). Pages built as one giant image are penalized — real text components must alternate with image slices.
8. **Review-less stores have a documented playbook.** Maker story + production photos transfer trust before reviews exist; pre-answered FAQ removes hesitation; first 10 reviews seeded via 체험단; native widgets (구매유도메세지, 베스트리뷰) replace fake social proof.
9. **HTML import is fragile on mobile.** Since 2025-05-28 Naver deletes iframes and shortened URLs. script/style are stripped. TABLE tags, A tags, and externally hosted images can degrade the auto-generated mobile page (75%+ of traffic). `<video>` tags are not the supported path — video must go through SmartEditor ONE's native 동영상 component. **Action: check the current live pages on a phone; the `<video>` blocks are likely silently dead.**

---

## 2. Catalog architecture

**Rule: split listings where the search intent (and Naver category) differs; consolidate as options where only an attribute differs.**

- A5 vs A6 → separate listings (different categories, different keywords).
- Robey editions at A5 → separate listings per edition (each edition owns its scene keywords; Moleskine 벚꽃 에디션 / Wearingeul 윤동주 필사노트 precedent).
- Ruling (무지/줄/모눈) → options inside a listing, never separate listings (로이텀/미도리 convention: 줄지/무지/방안 stacked in one listing; reviews pool).
- Robey editions at A6 → **one pooled listing** with edition as option, at least to start. No per-edition keyword exists at pocket size (buyers search 포켓노트/미니수첩/캐릭터수첩 generically), and pooling concentrates reviews. Split later only if one edition clearly dominates.

### The catalog (8 listings) — titles are KEYWORD-FIRST (revised June 2026)

| # | Product | 상품명 (title) | Category | Options |
|---|---------|----------------|----------|---------|
| 1 | Monjo A5 | 만년필 필사 노트 A5 실제본 무지 줄지 모눈 | 노트 50003556 | 속지 3종 |
| 2 | Monjo Pocket | 포켓 노트 A6 만년필 미니 수첩 실제본 무지 줄지 모눈 | 수첩 50003559 | 속지 3종 |
| 3 | Monjo Set (Cahier + Pocket) | 만년필 노트 세트 A5 A6 포켓 실제본 무지 줄지 모눈 | 노트 50003556 | A5 속지 + A6 속지 |
| 4 | Robey 001 A5 (꽃잎) | 일러스트 노트 A5 만년필 손제본 러비 꽃잎 에디션 | 노트 50003556 | 속지 3종 |
| 5 | Robey 002 A5 (풍선) | 일러스트 노트 A5 만년필 손제본 러비 풍선 에디션 | 노트 50003556 | 속지 3종 |
| 6 | Robey 003 A5 (도서관) | 독서 필사 노트 A5 만년필 일러스트 손제본 러비 작은 도서관 | 노트 50003556 | 속지 3종 |
| 7 | Robey Pocket | 일러스트 포켓 노트 A6 만년필 캐릭터 수첩 러비 | 수첩 50003559 | 에디션 3종 |
| 8 | Robey Pocket 3종 세트 | 일러스트 포켓 노트 A6 3종 세트 만년필 러비 | 수첩 50003559 | 속지 (단일 권장) |

**만년필 appears in every title (revised June 2026, Jordan's catch):** the paper is the shared core of every SKU, title matching is bag-of-words (a word absent from the 상품명 contributes nothing — tags are the weakest field), and verified autocomplete contains the combination queries 만년필 노트 a6 and 만년필 노트 세트 that listings #2/#3/#7/#8 should match. Placement rule: 만년필 leads only on #1; everywhere else it sits mid-title so each listing's lead cluster (포켓 노트 / 일러스트 노트 / 독서 필사) keeps the front 15–25 visible characters.

### Title order: keyword-first, brand nowhere in the title (verified June 2026)

A dedicated research pass (6 agents, adversarially verified) settled brand-first vs keyword-first:

- **The official "brand first" slot order is conditional, not a rule.** The guide's own wording is "있다면 필수적으로 기입하고 **가능한** 아래 순서대로 기입" — a formatting template for recognizable catalog brands. No penalty list anywhere includes brand omission or word order, and the [상품명 검색품질 체크] tool checks repetition, special characters, and promo words — never order.
- **The 브랜드 field beats in-title brand text.** Three independent sources quote the guide: a brand registered in the 브랜드/제조사 field outranks the same word written in the 상품명, and merely filling the field raises 적합도. The brand does not need title characters to be findable.
- **The store-name line shows 스튜디오몬조 on every result card for free.** Naver bans seller/shop names in titles precisely because 판매처명 displays separately. For a maker whose brand = shop name, leading with it pays twice for the same pixel.
- **적합도 matching inside the 상품명 is field-level bag-of-words** — no official position weighting exists. But CTR is a first-class ranking signal since the 2025 AI update, mobile shows only roughly the first 15–25 characters (no published clamp number; check on a real phone), and practitioner consensus is unanimous: "맨 앞에 핵심 키워드." A zero-search-volume brand token in that window is wasted CTR.
- **SERP reality matches:** established brands (로디아, 로이텀, 인디고) lead with brand because people search them; small unknown sellers in the same results go keyword-only. One documented small seller: "브랜드명... 사용하지 않고 오직 키워드만 사용했습니다."
- **2025 AI update style:** write titles as meaning units [제품군] + [차별점] + [사용 상황] + [규격], not keyword strings; stuffing is penalized.
- 러비 stays in Robey titles but AFTER the searched keywords — it is the product's identity, not a search term.
- **Retitling caution:** wholesale 상품명 rewrites on a live listing can reset its ranking (re-classified as a new product). Reviews survive either way. For the existing listing the catalog restructure justifies the one-time reset; for future tweaks, prefer additive keyword edits over rewrites.
- Register 스튜디오몬조 in the 브랜드 field on every SKU regardless. Longer term, trademark-backed 브랜드 등록 (2–3 week review) unlocks the 공식 브랜드 mark.
- Run **[상품명 검색품질 체크]** on every title before publishing — it is the arbiter if the 노트+수첩 combination in #2/#7 trips the synonym filter (fallback: drop the 수첩 token from the title, keep it in tags). No 선물/추천/감성/프리미엄 anywhere (promo-modifier flags).

### Naming notes

- **No brand tokens in titles at all** (revised — see "Title order" above). 스튜디오몬조 lives in the 브랜드 field and the store-name line; "몬조"/"몬조 라인" live in the detail page, the cover mark, and the option labels. Nobody searches any of them yet.
- **러비 stays in Hangul** (다이노탱 precedent: English brand design, but Koreans search in Hangul). Edition numbers (001/002/003) carry zero search value — keep them in the page and option names, not the title.
- **001 is NOT titled 벚꽃.** The painted petals are red — camellia/plum reading, not pink cherry blossom. 벚꽃 is a proven, annually recurring seasonal query (Moleskine/Daiso run yearly 벚꽃 에디션), but borrowing it dishonestly buys clicks and returns. Title uses 꽃잎 에디션; 봄/꽃잎 go in tags. **Product roadmap note: a true pink 벚꽃 Robey edition launched Feb–Apr would slot into a proven seasonal query with atelier-level competition near zero.**
- **003 carries the 독서/필사 load.** The library scene legitimately frames a 독서 기록 use case (MUJI precedent appends use-case keywords). 독서노트 #26, 독서기록장 #66, both riding 텍스트힙. This is the edition with the most search momentum behind it.
- **002 has no search anchor** (balloons aren't a query). It is the birthday/congratulations gift SKU — carried by tags and the thumbnail, not the title.

### Brand field, 속성, tags

- Register **스튜디오몬조** in the 브랜드/제조사 field (brand-field matches outrank title matches once people search the brand).
- Fill every 속성 field: 사이즈 (A5/A6), 제본 (실제본/사철제본), 내지 (무지/유선/모눈), 매수 (48쪽 = 24매), 용도. Attribute completion alone moves rank (적합도 field).
- Exactly 10 tags per listing, picked from Naver's tag dictionary (confirm the tag ID appears in parentheses when entering). Pools — REVISED June 2026 against verified absolute volumes (Naver SearchAd via ma-pia, monthly PC+Mobile): dead tags removed (미니멀노트 0, 화이트노트 0, 손제본노트 0, 수첩세트 0), live ones added:
  - **#1 Monjo A5:** 만년필노트(730), 필사노트(4,590), 무지노트(1,270), 모눈노트(1,230), 줄노트(1,130), A5노트(830), 필기노트(720), 사철제본(480), 필사노트추천(610), 두꺼운노트(310)
  - **#2 Monjo Pocket:** 포켓노트(1,050), 미니수첩(1,250), 미니노트(45,800 — mixed intent, see note), 포켓수첩(470), 휴대용수첩, A6노트(890), 메모수첩, 사철제본(480), 드로잉노트(390), 만년필노트(730)
  - **#3 Monjo Set (Cahier + Pocket — REVISED June 2026, Jordan's call):** 노트세트, 만년필노트(730), A5노트(830), A6노트(890), 포켓노트(1,050), 필사노트(4,590), 미니노트, 무지노트(1,270), 사철제본(480), 문구선물. The A5+A6 cross-size set is market-validated: 상지사 조선의노트 ranks for 만년필노트 with exactly a 스타터 패키지 A5+A6 pattern. Pack price: Field Notes model, 10–13% under ₩65,000+₩25,000=₩90,000 → ₩78,000–81,000. The 3권 세트 concept survives only as the Robey 3종 세트 (#8). Concept name: 책상에 한 권, 주머니에 한 권.
  - **#4–5 Robey A5:** 일러스트노트, 캐릭터노트, 감성노트, 귀여운노트, 필사노트(4,590), 만년필선물(840), 드로잉노트(390) + per-edition: 꽃잎/봄노트 (001), 생일선물/축하선물 (002 — gift words live here, never in titles)
  - **#6 Robey 003:** 독서노트(2,010), 독서기록장(1,360), 독서록(3,160), 필사노트(4,590), 일러스트노트, 책선물(720), 만년필노트(730), 독서용품(670), 감성노트, 드로잉노트(390)
  - **#7–8 Robey Pocket:** 미니수첩(1,250), 포켓노트(1,050), 미니노트(45,800), 귀여운수첩, 만년필선물(840), 드로잉노트(390), A6노트(890), 가방수첩 + 캐릭터수첩 (30/mo — keep only if a slot remains)

**Validation notes (verified June 2026, two independent pulls):**
- **독서필사노트 = 40/mo, informational intent** (autocomplete: 뜻/방법/잘하는 법). No action needed: Naver decomposes compound queries to morphemes — SERP highlighting proves titles with spaced, even non-adjacent, even reordered tokens match — so #6's "독서 필사 노트" construction already covers it, and the identical token pattern is what currently ranks (컴포지션스튜디오 "독서 필사 노트 A5 ... 만년필 노트").
- **일러스트노트 = 20/mo, 캐릭터수첩 = 30/mo**: the Robey lead tokens are CTR descriptors and brand builders, not search capture. Edition listings get their search traffic via 만년필+노트+A5/A6 decomposition and tags; 러비 queries (currently 0/mo as compounds) are the long-term brand build.
- **미니노트 = 45,800/mo** (10× the whole A6 keyword set combined) but mixed intent (mini-laptop pollution, very low ad CTR) — carried as a tag on all A6 listings, never as a title bet.
- **성경필사노트 = 3,160/mo with 6.95% mobile ad CTR — the highest purchase-intent signal in the dataset.** Open decision for Jordan: the plain A5 honestly serves bible transcription; adopting the tag/merchandising is a brand-fit call (the single test), consciously taken or consciously forgone.
- **양장노트 (640/mo) rejected on honesty**: the sewn softcover is not 양장 (hardcover).
- **Post-launch ritual:** spot-search 필사노트, 만년필노트, 포켓노트, 무지노트, 모눈노트 in the shopping tab once each listing is live to confirm exposure (the 생삼겹살-type dictionary-compound edge case can only be ruled out on a live listing).

---

## 3. Detail page master architecture

**REVISED June 2026 — the four movements.** The eight blocks below remain the inventory of page elements, but the governing structure is now four movements (Jordan's direction, Field Notes as the model; full narrative rules in ROBEY_WORLD.md):

1. **러비의 인사** (Robey) / **물건의 정체** (Monjo) — Robey greets and names the setting, never the story (the letter ships with the notebook; the page only promises it). Monjo opens on the object's identity: the 카이에, the French school notebook 몬조단 learned to write in — not "A5". The pocket is the notebook that follows you — not "A6". Robey pages get a 표지 block (artwork close-up; medium never named — some editions are watercolour, some painted on iPad, see ROBEY_WORLD.md); the REAL photos behind the paintings never appear on pages (they break the world) — they are blog/Instagram backstage content only. The cahier's ink heritage (French schoolchildren write with fountain pens; dip pens before them; a cahier's paper must hold ink) lives in the Monjo 작업실 and 종이 blocks — it makes the 105g claim biographical, not technical.
2. **물건** — binding, lay-flat, inside details, use scenes. Dimensions describe, they don't define.
3. **작업실** — THE FIXED BRAND LAYER, identical on every product (Jordan's rule, June 2026). Canonical text, three paragraphs: (1) 프랑스의 학교에서 아이들은 카이에라는 공책에 만년필로 글씨를 배웁니다. 펜촉을 잉크병에 찍어 쓰던 시절부터, 카이에는 잉크와 함께 자란 공책입니다. 몬조단도 그 교실에서 처음 글씨를 배웠습니다. (2) the fifteen-year tech career and the return to the hand. (3) 그래서 서울에 작은 글쓰기 작업실을 열고, 학교에서 쓰던 그 공책을 다시 만들기 시작했습니다. Heading: 프랑스의 교실에서, 서울의 작업실로. Then the five steps (thread color per line/edition) and the closing line. Robey pages append one paragraph: the Robey origin (작은 로봇, 서울 발견, scenes from real moments, 그림부터 제본까지 한 사람의 손에서). Nothing else varies.

**Robey use-case rule (June 2026):** every Robey 쓰임 trio = the edition's anchor use (e.g. 독서 기록과 필사 for 003) + 하루의 일기 + 펜 드로잉 — journaling and pen drawing are the verified line-level wants in Korea and appear on every edition; the gift framing follows as a sentence after the cards, never as a card.
4. **안심** — paper, calibrated ink claims, options, specs, FAQ. Last and quiet.

Canonical pages: **naver/monjo-a5.html** (Monjo variant) and **naver/robey-003-a5.html** (Robey variant). Roll the remaining six onto these models. Robey closes: 노트가 도착하면, 러비의 편지가 먼저 인사를 드립니다 / 그다음 페이지는 당신의 차례입니다.

Container design stays clean and minimal — no painted UI elements (brand book: contents never leak into the container). Illustrations enter as photographed content: macro close-ups of each edition's artwork (added to the shoot list).

One column, 860px, mobile-first. NOT the old template (hero → chips → logistics → story). The page is "a fight to make them scroll": >50% bounce at the first screen, and since March 2025 dwell + conversion feed search rank.

**Technical baseline:** single-column stack; no tables, no iframes, no `<video>` tags, **zero `<a>` tags of any kind** (Naver prohibits external links on detail pages — cross-sell is plain text "스토어에서 보실 수 있습니다"; the old monjo-line/edition pages each carried 2 category links and are fully replaced by the new link-free pages); slice images ≤1100px tall sections (hard caps 5,000px/20MB per image); alternate REAL TEXT blocks between image slices (통이미지-only pages are penalized; ~1% keyword density in live text; in-image text under 20% of area, ≥18px). At publish time, re-upload images natively in SmartEditor ONE rather than hotlinking studiomonjo.com (safer mobile rendering, and removes the deployment dependency).

**Motion house pattern (confirmed by Jordan's testing):** GIFs do not play on Naver mobile, so every motion moment is a 3-still strip image first, GIF directly below it. The stills carry the content; the GIF is a desktop bonus. Native SmartEditor ONE 동영상 components remain an optional upgrade but are not required by the template. Never reuse footage of a different product line (e.g. card-making clips on a notebook listing) — process imagery must match the product being sold.

**Paper disclosure rule:** the paper source stays private (Jordan sourced it himself). Describe by spec only: 105g/㎡, white with a slight cream tone, fountain-pen friendly. The weight is the trust number — state it in the proof block, the spec row, and the 비침 FAQ answer.

**Packaging (decided June 2026 — standard for ALL orders):** every order ships wrapped in translucent paper, tied with twine, with a handwritten card. Every page gets a 포장 block (photo + two lines) and the gift FAQ answers affirmatively — this closed the eight gift-wrap fill-ins. The packaging photo doubles as a top 추가이미지 on every listing. Open: the handwritten cards are signed 조단 while pages say 몬조단 — Jordan to unify or deliberately split.

**Drawing/marker claim (researched + verified June 2026):** drawing is a secondary use-case line inside the 만년필 노트 positioning, never a repositioning. The crossover audience is fountain-pen drawing — 펜드로잉 ~1,850 searches/mo, 어반스케치, pen people who draw to keep pens inked — not marker users. Marker keywords are dead (마카노트, 마카 비침: zero volume), and bare 마카 in Korean means ALCOHOL markers (코픽, 신한 터치), which penetrate any uncoated paper regardless of gsm; the category's bleed-proof standard is 70g coated 마카패드, so a "105g stops markers" claim reads as inexperienced and invites refuting reviews. Rules: (1) claim 만년필/펜 드로잉 freely; (2) marker claims name the tested pens and split 수성 vs 알코올, with alcohol explicitly excluded; (3) proof = unedited front/back photo pair per pen (the reviewer convention); (4) 드로잉노트 (~410/mo, stays in the 노트 category) may be added as a tag; never use 스케치북/드로잉북 in names — they drag the listing into the 미술/화방 category against 다이소/캔손 price anchors.

### The eight blocks

1. **Hook (first viewport).** One photo of the product in use (writing, not the object alone) + one line of ≤15 Korean characters + one differentiator line.
   - Monjo A5: 만년필이 편한 손제본 노트 / 번짐과 비침이 적은 종이를 골라 서울에서 한 권씩 엮습니다.
   - Monjo Pocket: 주머니 속의 작은 노트 / 엽서 크기, 실제본, 만년필 친화 종이.
   - Robey A5: 이야기가 있는 손제본 노트 / 몬조단이 그린 러비의 장면이 표지가 됩니다.
   - 3종 세트: 세 가지 장면, 세 권의 수첩.
2. **Three proofs, one per screen.** Paper (만년필, 번짐 없음, 비침 적음, 평량 표기) · Binding (실제본, 180도 펼침 — the lay-flat photo) · Made in Seoul (주문 후 한 권씩 제작). Write in the fountain-pen community's own vocabulary: 번짐, 비침, 사각거림, 잉크 발색, 평량, 180도 펼침.
3. **The pain-point block.** Name the problem before the solution: "만년필을 쓰면 뒷장에 잉크가 배어 나옵니다." Then the ink-test photo sequence and the writing video (native component). This is the conversion engine for pen people — their stated pain in community threads is literally "제 노트는 다 번져서."
4. **Usage scenes.** A5: desk, meeting, evening 필사. Pocket: hand, jacket pocket, bag, standing note. Robey: gift moment, story card, first page. Buyers must see themselves; abundant scene photos are the documented substitute for missing reviews.
5. **Maker block.** Compressed: who (몬조단, 프랑스 출신, 서울 작업실), why (화면의 속도에서 손의 속도로), and the process — atelier photos + the five steps (자르고, 접고, 구멍 내고, 실로 엮고, 검수). This is the ₩-justification and the trust transfer. For Robey pages: the storytelling layer is defined in **ROBEY_WORLD.md** (June 2026) — Robey speaks in first person via his letter (the story card text verbatim/excerpted), each page carries a provenance block (몬조단's original photo → the painting), and the handover line 이제 이 노트는 당신의 것입니다 closes the page. robey-003-a5.html is the canonical world-page; 001/002 follow once their letters arrive. Monjo stays terse — the world lives only in Robey. **Robey order exception (decided June 2026 QA):** on Robey pages the edition story and story card sit BEFORE the proof blocks — the gift/diary buyer (ICP 2) purchases the scene first, proof second. This is deliberate, not drift.

**Process footage rule:** the old binding GIF (robey-binding-thread-work) shows the bound-card product being stitched, not a notebook, and was removed from all eight pages in the June 2026 QA. Maker blocks run text-only (five steps + closing line) until notebook-sewing footage exists.
6. **Specs + paper marks.** Spec list as image or text rows (no TABLE tags). FSC/무염소/무산성 explained in one line each.
7. **FAQ (pre-answered objections).** 배송은 언제 되나요 (주문 후 제작 N일) · 만년필 잉크가 번지나요 (평량 + 테스트 결과) · 뒷면 비침은요 · 펼쳐서 쓸 수 있나요 (180도) · 선물 포장이 되나요 · 속지는 바꿀 수 있나요. Shipping promise and CS contact sit here, high trust value for a new store.
8. **Close.** Review invitation (첫 페이지 사진과 함께), 스토어 찜/알림, cross-link line to the sibling size and the Robey/Monjo counterpart. One quiet closing sentence in brand voice. No urgency blocks ever — where Korean guides say 한정수량, we substitute the made-to-order rhythm stated plainly.

### Platform-level setup (do once)

- Enable 구매유도메세지 and 베스트리뷰 상단 노출 widgets (스토어전시관리 > 스마트스토어).
- Pin a 공지사항 above all products: first-review event or workshop note.
- Seed the first 10 reviews per listing via 체험단; never buy reviews (store-level suspension risk).

---

## 4. Photography system

**대표이미지 (thumbnail), every listing:** the notebook on black felt, centered, even bright light, 1000×1000, zero text, zero logo overlay, no border. The orange-balloon-on-black shot is the system reference. White covers (Monjo) gain maximum contrast; in a search grid of white cutouts, black wins the click, and clicks feed 7-day 인기도.

- 3-pack thumbnails: the three notebooks fanned/stacked on black — showing quantity with the product photo is the compliant way (수량별 이미지 explicitly allowed; "3권" as text is not).
- 추가이미지 (up to 9): spine thread close-up · open 180도 flat · nib-on-paper close-up · in-hand scale (A6) · jacket pocket (A6) · story card (Robey) · atelier process still · back cover with paper marks.

**The rule for "should it all be the same":** thumbnails YES — one system (same felt, same light, same centering) so the store grid reads as one brand. Everything else NO — the 추가이미지 and page images carry *varied* proof: detail, scale, use, process. Uniform shelf, varied evidence.

**Thumbnail background (FINAL June 2026 — navy linen, after Jordan's tests):** The evidence trail: visual SERP survey found zero organic dark tiles across 45 ranking thumbnails (dark deviation is real); Jordan's cream test proved plain bright backgrounds wash out the white covers (the planned bright default died empirically); Jordan's **deep navy linen** test produced the strongest product shot of the set. Navy linen beats black on every axis: it avoids dark's documented failure mode (white notebook fills the frame, brightly lit — the tile's center stays bright), the orange/red accents glow against the complementary navy, and it carries two brand stories black lacked (blue-black = the classic fountain-pen ink color; linen = the Sajou thread material). Decision:
1. **Navy linen is THE system surface** — product shots, 추가이미지, in-page heroes, banners, site, Instagram. Black felt is retired.
2. **대표이미지: launch on navy, with a loaded fallback.** Shoot the same frames on 옅은 그레이 in the same session (felt swap, minutes). If week-one CTR/traffic reads weak against category norms, swap to gray — thumbnails are freely swappable and CTR is a 7-day signal. The deviation bet is taken consciously: a uniform navy store grid is instantly recognizable shelf identity nobody in the category has.
3. **003 thread clash** (navy thread on navy linen): angle the spine to catch light or let the warm library art carry the tile; never break system uniformity for the thread sliver.
4. Composition rules: product fills 70–80% of frame, brightly lit (the failure mode is the dim atmospheric small-product shot), no text/borders/props on thumbnail crops (2024-10-28 rules; violation = delisting).

**Session A — black felt (thumbnails + page heroes; one session, one light):**
1. Monjo A5 single, front, centered
2. Monjo Pocket single
3. A5 + Pocket pair (size comparison, cross-sell image)
4. Monjo Pocket 3권 fan (pack thumbnail — quantity shown by photo, never text)
5. Robey 001 cover
6. Robey 003 cover (002 exists — reshoot only if the light mismatches)
7. Robey Pocket trio, three editions side by side
8. Robey Pocket 3종 fan, three thread colors visible
9. Spine row: all thread colors lined up (brand shot, future banner candidate)
Shoot 3:2 but frame every product so a centered 1000×1000 crop works. No text, logo, or border on any thumbnail crop (2024-10-28 rules; violation = delisting).

**Session B — scale and carry (Pocket listings):**
10. Pocket on an open palm
11. Pocket half-in a jacket inner pocket
12. Pocket next to a postcard (the 엽서 크기 proof)
13. One-hand open, standing

**Session C — use and writing (hooks + scene blocks):**
14. Hand writing with a fountain pen on the open A5, EF/F nib visible (Korea is a fine-nib market — the nib in photos should be one)
15. Desk scene, morning
16. 필사 evening scene: open book + notebook + pen (003's keyword made visible)
17. 180도 flat, nothing pressing it

**Session D — paper proof (per PAPER_TEST_PROTOCOL_2026.md; register rule applies):**
18. Front/back pair of a fully written page — replaces the ink strip in every 종이 block
19. Timed dry strip, full battery grid, the honest fail — blog only
20. 30–60s close-mic writing sound clip — Instagram + native 동영상 component

**Session E — atelier and maker (the zero-review trust layer):**
21. Hands sewing a NOTEBOOK: 3-still strip + GIF/video clip, ideally once per thread color (the old binding GIF showed the card product and was removed from all pages — this is the replacement)
22. Folding and pressing steps
23. The stamp being pressed (the vermillion seal moment — brand signature)
24. Story card beside each edition (002's card shot is missing)

**Priority if time-boxed:** Session A → 14 → Session B → 18 → the rest. Thumbnails gate everything.

**Upload mapping per listing (대표 1 + 추가 up to 9):** 대표 = the felt shot. 추가 in order: thread close-up (color-matched to the edition), 180도 open, nib-on-paper close, front/back proof pair, scale shot (A6 listings), story card (Robey listings), paper marks, atelier still, size pair.

---

## 5. Packs

**Model: Field Notes, not MUJI.** Premium pocket 3-packs in Korea sell the pack as the standard unit (필드노트 3팩 22,800원 = 7,600원/권, no deep discount). Commodity sets discount hard (MUJI 5권 세트 ≈ 1,888원/권). The pack price should sit 10–13% under three singles — enough to reward, not enough to signal commodity. At ₩25,000 a single pocket: 3권 세트 at ₩65,000–67,000.

- **Monjo Pocket 3권 세트** (#3): same notebook ×3, option for 속지 구성 (무지 3 / 줄 3 / 모눈 3 / 혼합). The carry-one-archive-two pattern Field Notes built its brand on.
- **Robey Pocket 3종 세트** (#8): one of each edition — 꽃잎, 풍선, 도서관. **N종 counts designs, N권 counts copies** (verified convention; 일러스트 노트 6종 세트 precedent). This is the hero gift SKU: three scenes, one box.
- Gift-set naming convention if ever bundling beyond notebooks: 세트 (구성품+구성품) in parentheses — e.g. 세트 (노트+엽서) — per goodsshop/모트모트 pattern.
- **Personalization flag:** on idus, 26% of orders are gifts and 34% of handmade gift orders involve 각인/lettering — the single highest-leverage gift feature. A name stamp as 추가상품 on gift SKUs would fit the seal/stamp practice. Decide against the single test; data says it converts.

---

## 6. Launch sequence

1. Fix photography first (section 4) — thumbnails gate everything.
2. Relaunch one listing per week, not all at once: each new listing gets a temporary 최신성 (freshness) exposure boost; concentrate Instagram/blog/단골 traffic into each listing's first 7 days to convert the boost into 클릭수/판매실적 before it decays.
3. Order: #1 Monjo A5 (the anchor) → #2 Pocket → #6 Robey 003 (most keyword momentum: 독서/필사) → #7 Robey Pocket → #4, #5 → #3, #8 packs before a gift season (가정의 달 May, 추석, Christmas; idus gift-order peaks).
4. Keep the existing listing's reviews: convert the current Monjo listing in place to the new A5 title/page (reviews survive a title edit; they do not survive a new listing).
5. Flank with Naver blog posts targeting the research queries that precede purchase: 만년필 종이 비교, 만년필 노트 추천, 필사 노트 추천. Small brands win blog/cafe shelf space long before shopping rank.
6. Consider a parallel idus presence for the gift SKUs — handmade pricing is native there (₩78,000 leather covers accepted) and the handmade-notebook field is nearly uncontested.
7. Re-verify the final keyword shortlist (만년필노트, 필사노트, 포켓노트, 미니수첩, A5노트, 무지노트) in 아이템스카우트 or 판다랭크 (free login) for absolute volumes before locking titles — DataLab ranks are relative click shares.

---

## 7. Open decisions

1. **Pocket single price** (assumed ₩25,000 here) → sets pack price.
2. **001 naming:** accept 꽃 일러스트, or hold the 벚꽃 slot for a future true cherry-blossom edition (recommended).
3. **Robey Pocket pooled vs per-edition** — pooled recommended at launch; revisit with sales data.
4. **Name-stamp 추가상품** on gift SKUs — yes/no against the single test.
5. **Verify on a phone whether the current live detail pages render their `<video>` tags and flex rows** — research says they likely don't; if confirmed, the rebuild moves video to native components and flattens all layouts to single column.

Supersedes: naver/monjo-line-a5.html and naver/monjo-line-pocket.html (built before this research; structure and titles outdated).
