# Agency Grader — Team Brief

**Date:** March 22, 2026
**Status:** Strategy approved, Phase 1 prototype built, rubric finalized
**Goal:** Ship a free, public-facing tool at grader.policylift.ai that scores an insurance agency's digital presence and drives demo bookings.

---

## What is it?

A free tool where an agency owner types their business name and gets a scored audit of their online presence in ~30 seconds. No signup, no email gate. The full report is free. The CTA is "Book a Demo."

**Inspiration:** Owner.com's Restaurant Grader, HubSpot's Website Grader. Our twist: no email wall, Google Places data identifies the agency automatically, and the report maps every gap to a PolicyLift product.

---

## The Funnel Structure

The grader is organized around the PolicyLift funnel. The funnel IS the report — not a separate visual on top of it.

```
┌──────────────────────────────────────────────────────┐
│  1. DISCOVERY — "Can they find you?"                  │
│     10 checks · 50 points · SCORED                    │
├──────────────────────────────────────────────────────┤
│  2. TRUST — "Do they trust you?"                      │
│     5 checks · 25 points · SCORED                     │
├──────────────────────────────────────────────────────┤
│  3. CAPTURE & QUALIFY                                 │
│     "Can they reach you and start the process?"       │
│     4 checks · 25 points · SCORED                     │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│  4. INTAKE → QUOTE → BIND → SERVICE                  │
│     "PolicyLift automates the rest with AI."          │
│     NOT SCORED — this is the CTA                      │
└──────────────────────────────────────────────────────┘
```

**Why this structure:** Agency owners understand the funnel because it maps to their actual business. We score the top 3 stages (what's measurable from outside). The bottom stage is the hook into the full platform demo.

---

## What We Score (19 checks, 100 points)

### Stage 1: Discovery — 50 pts

| Check | Source |
|-------|--------|
| Ranks for "[city] insurance" keywords | SEMrush |
| Organic keyword count ≥ 50 | SEMrush |
| Domain Authority ≥ 20 | SEMrush |
| Page load under 3 seconds | Lighthouse |
| Mobile-responsive site | Lighthouse |
| Title/meta includes city + "insurance" | Firecrawl |
| Non-brand traffic > 20% | SEMrush |
| Has dedicated local/coverage pages | Firecrawl |
| Backlink health (toxic vs legit ratio) | SEMrush |
| Monthly organic traffic ≥ 200 | SEMrush |

**Why it's heavy:** SEO problems produce the most concrete, personalized data. "You rank for 299 keywords but only 3 people a month are actually shopping for insurance" is a gut punch. This stage also ties into the existing PolicyLift SEO audit report as an upsell.

### Stage 2: Trust — 25 pts

| Check | Source |
|-------|--------|
| Google rating ≥ 4.5 | Google Places |
| 50+ Google reviews | Google Places |
| Review within last 30 days | Google Places |
| Owner responds to reviews | Google Places |
| Reviews showcased on website | Firecrawl |

### Stage 3: Capture & Qualify — 25 pts

| Check | Source |
|-------|--------|
| After-hours availability (voice AI, chat, or evening/weekend hours) | Places + Firecrawl |
| AI-powered chat (not just a basic live chat widget) | Firecrawl |
| Insurance-specific forms (asks coverage type, vehicle, etc.) | Firecrawl |
| Self-service booking/calendar | Firecrawl |

**Design principle for checks:** Every check should be something most agencies FAIL. No filler like "phone number on website." If everyone passes it, it doesn't belong.

---

## User Flow

```
1. Landing page → single input with Google Places autocomplete
2. "Grade My Agency" → 30-second scanning animation
   - APIs fire in parallel, results stream via SSE
   - Animation reveals their own data back to them (the emotional hook)
3. Results page (no gate):
   - Score donut + letter grade (A-F, out of 100)
   - Funnel walkthrough with scored stages + checks
   - Stage 4 as CTA: "PolicyLift automates the rest"
   - "Book a Demo" button
```

**Key UX decisions:**
- 30-second animation is choreographed, not dependent on API speed. Early results are buffered until their animation slot.
- 60-second hard timeout. Show whatever's ready, mark the rest "Unable to verify."
- If a check can't be verified, it's NOT scored as a failure. Neutral icon, asterisk on score.
- No website detected = special report variant. Only scores Trust. Strongest pitch for Website Wizard.

---

## Tech Stack

| Component | Tech |
|-----------|------|
| Frontend + API | Next.js (App Router) on Vercel |
| Business lookup | Google Places API |
| SEO data | SEMrush API |
| Website scraping | Firecrawl (single crawl per domain, shared across all checks) |
| Page speed | Lighthouse/PageSpeed Insights API |
| Lead tracking | HubSpot API (Phase 4) |
| AI verdict | Claude API — Haiku (Phase 4) |
| Cache | Vercel KV — SEMrush 7-day TTL, everything else 24hr |

---

## What's Built (Phase 1)

- Next.js scaffold with Tailwind, all design tokens from brand guidelines
- Google Places autocomplete → SSE scan → results page
- Trust scoring (4 checks from Places API) + partial Availability scoring
- Funnel walkthrough component
- Running locally at localhost:3000

## What's Next

| Phase | Scope |
|-------|-------|
| **Phase 2** | Lighthouse integration (page speed, mobile), scoring engine with all 19 checks, results page polish |
| **Phase 3** | SEMrush + Firecrawl integration, AI chat detection, form analysis |
| **Phase 4** | Scanning animation choreography, AI verdict (Claude), HubSpot lead creation, caching, rate limiting |
| **Phase 5** | Deploy to grader.policylift.ai, test with 20 real agencies, fix accuracy issues |

---

## Design Team — What We Need

1. **Funnel visualization** — the funnel graphic from our brand materials, adapted to show scores on the top 3 stages and the CTA on stage 4. Needs to work on mobile (stacked) and desktop.
2. **Scanning animation** — choreographed 30-second reveal. Each stage shows the agency's own data. See the full spec in `docs/agency-grader-rubric-v2.md` for stage timing.
3. **Results page layout** — score donut + letter grade above fold, funnel walkthrough below, CTA at bottom. Each check shows pass/fail/unverified with evidence.
4. **Error states** — no results found, scan timeout, no website detected, partial results. These need to feel warm, not dead-end.
5. **Mobile responsive** — full-width input on landing, stacked funnel on results, sticky "Book a Demo" button.

---

## Key Decisions Already Made

- **No email gate.** Google Places gives us the lead data. CTA is demo booking, not email capture.
- **Funnel is the report structure.** No separate category names competing with funnel stages.
- **Score out of 100.** Weighted 50/25/25 across the 3 scored stages.
- **Confidence handling.** "Unable to verify" ≠ failure. Honest about detection limits.
- **Discovery is the SEO teaser.** The full SEO audit report already exists — the grader flags the problems, the demo delivers the deep dive.
- **Check quality over quantity.** Every check must be something most agencies fail. We cut "phone number visible" and "multiple contact channels" because they're filler.
