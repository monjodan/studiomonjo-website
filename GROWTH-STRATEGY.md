# Studio Monjo — Growth Strategy
*June 2026 · Goal: build the brand and the income · Market: Korea first · Capacity: 80+ notebooks/month*

---

## 1. Diagnosis

You built the back office of a company that doesn't have a front door yet.

**What's strong:**
- Product and story are genuinely differentiated: a French writing house in Seoul, hand-sewn notebooks, the Robey 50-edition scarcity model, "slow objects as a counterweight to AI" — this is a brand, not a stationery SKU.
- Operations are over-built for your stage (in a good way): finance closes itself, orders flow into a CRM, provenance is tracked, trend briefs arrive weekly. Most makers at 100x your revenue don't have this.
- Capacity is not the constraint. You can make 80+/month and you're selling ~6/week, mostly to friends and at flea markets.

**The core gap:** demand generation. Nothing in the system *creates* customers. Nari finds trends, Colette guards the brand, Soo handles buyers — but no one is responsible for the top of the funnel, and you can't even measure it: the site has **no analytics, no email capture, and no direct conversion path** (it routes Korean buyers off to Naver and French buyers to a PayPal link).

10–12 sales in 2 weeks from friends + flea market is actually a *good* signal — the product converts when people see it. The job is to make strangers see it, repeatedly, in a system rather than by accident.

---

## 2. What's missing (in priority order)

1. **Measurement.** No analytics on the site, no tracking of where buyers came from. You cannot grow what you can't see. (Naver SmartStore has built-in stats — use them — but the site itself is blind.)
2. **An owned audience.** No email list, no KakaoTalk Channel, no Instagram→capture loop. Every flea-market conversation evaporates. The Courrier subscriber list is the only owned audience you have, and it's France-only.
3. **A demand engine.** Content exists (Robey stories, the craft, the studio) but there's no production cadence and no distribution system. Instagram is ad hoc.
4. **A drop mechanic.** The 50-edition model is your single best marketing asset and it's currently invisible. "1 original, 50 prints, then closed forever" should be a public countdown, not a footnote.
5. **Korean marketplace presence.** You're only on Naver SmartStore. Korean handmade buyers live on **idus** (the #1 handmade platform), discover curated brands on **29CM**, and fund creators on **Tumblbug**. You're absent from all three.
6. **A repeat-purchase loop.** Soo records buyers but nothing re-contacts them. Notebooks run out — a finished notebook is a reorder trigger no one is pulling.
7. **Social proof.** No reviews surfaced anywhere, no UGC loop, no press. In Korea especially, Naver reviews and blog posts drive purchase decisions.

---

## 3. The growth model

Treat each Robey edition as a **drop**, and build a flywheel around it:

```
Robey story content (IG reels + Naver blog)
        → followers + Kakao/email list
        → edition drop announced to list first ("xx/50 left")
        → sells on Naver / idus / site
        → Soo ships + asks for review/photo
        → UGC + reviews feed the next drop's content
        → workshops convert fans into superfans (and UGC)
```

Workshops are your secret weapon: ₩59,000 revenue per seat, but more importantly each attendee is a content source, a reviewer, and a word-of-mouth node. Run them on **Frip** (프립) to reach strangers, not just followers.

---

## 4. 90-day plan

### Phase 1 — Instrument & capture (weeks 1–2)
- Add analytics to studiomonjo.com (Plausible or GA4) + Naver Search Advisor registration so the site indexes in Naver.
- Add email capture (newsletter signup) to the site — bilingual KR/EN. Single promise: "first access to each edition of 50."
- Open a **KakaoTalk Channel** — this is the Korean email list. QR code on every flea-market table, in every shipped parcel.
- Put a card in every parcel: QR → Kakao Channel + review request.
- Start logging source per order in Soo's CRM (where did this buyer come from?). One field, big payoff.

### Phase 2 — Demand engine + channels (weeks 3–8)
- **Content cadence:** 3 Instagram reels/week. Pillars: (a) Robey's story per edition, (b) hands binding/painting — process content massively outperforms product shots in craft niches, (c) the founder story — French maker in Seoul writing letters home. Reuse everything on Naver Blog (critical for Korean SEO).
- **List on idus.** Handmade buyers with purchase intent already there; reviews accumulate fast.
- **Apply to 29CM** as a curated brand (longer shot, high prestige; their stationery push is growing — they just partnered with Japan's Loft).
- **Put workshops on Frip** and raise frequency to weekly if they fill.
- **First public drop:** next Robey edition announced 1 week ahead to Kakao/email, live countdown of remaining numbers on Instagram. Even to a small list, run the ritual — you're building the habit and the format.

### Phase 3 — Compound (weeks 9–13)
- **Tumblbug campaign** for a special edition (e.g., a larger-format Robey or a boxed set). Korean creators use Tumblbug as marketing, not just funding — a funded project is social proof and a press hook.
- **Pop-up/fair calendar:** apply now for fall — Seoul International Stationery & Office Fair is at COEX Oct 22–24, 2026; also K-Illustration Fair and Seongsu/Yeonnam pop-up spaces. Flea markets validated you; fairs scale you.
- **Wholesale test:** 5–10 independent stationery/bookshops (Object, Seongsu/Yeonnam boutiques) with a small consignment line of Monjo Line notebooks.
- Reorder campaign: Soo messages buyers ~8 weeks post-purchase ("Robey edition no. 7 opens this week — your notebook must be nearly full").

---

## 5. Make the agents work on growth

Your agent roster is ops-heavy. Rebalance it:

| Action | Detail |
|---|---|
| **New persona: growth-analyst** | Weekly scorecard (cron, Monday): sales by channel, follower growth, list growth, review count, conversion. Pulls from Naver stats, analytics, Soo's CRM. This is the missing twin of Jason's finance brief. |
| **Extend Nari → content pipeline** | She already writes trend briefs and Robey stories. Add a weekly output: 3 reel scripts + captions (KR/EN) + Naver blog post draft, reviewed by Colette. You only shoot and post. |
| **Extend Soo → retention** | Post-delivery review request (day +3), reorder nudge (week +8), drop announcement to past buyers. The CRM data is already there. |
| **Wire the Naver SmartStore API** | Already a marked TODO. Unlocks automatic source/sales data for the scorecard and removes manual order pasting. |
| **Park the scaffolded personas** | legal, R&D, sensitive-data, global-expansion: none are on the critical path. Don't spend cycles there until Korea works. |

---

## 6. Scorecard (review weekly, 6 numbers only)

| Metric | Now | 90-day target |
|---|---|---|
| Notebooks sold / month | ~20 | 60 |
| Owned audience (Kakao + email) | ~0 | 500 |
| Instagram followers | ? (baseline week 1) | +1,500 |
| Workshop seats / month | ? | 24 (3 sessions × 8) |
| Repeat purchase rate | ? | 15% |
| Naver/idus reviews | ~0 | 30 |

12-month direction if the flywheel turns: 80 notebooks/month at capacity (~₩3–4M), weekly workshops (~₩1.4M), Courrier growth in France, wholesale as the overflow channel — and the decision point about outsourcing part of production arrives as a *good* problem.

---

## 7. The one-sentence version

Stop building the machine and start feeding it: instrument the site, capture every contact into Kakao/email, turn each edition of 50 into a public drop, show up where Korean handmade buyers already are (idus, Frip, fairs), and give your agents a growth scorecard so demand gets the same weekly rigor Jason gives your books.
