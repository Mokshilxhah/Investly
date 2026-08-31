# Startup Investment Intelligence Platform — Build Plan

**Deadline: Tomorrow, 9:00 PM** — treat every decision below through that lens. If something doesn't help you pass a working demo tomorrow, cut it.

---

## 1. What We're Actually Building

A **MERN web app** where an investment analyst can take a startup from "someone mentioned it" to "we decided INVEST/WATCHLIST/REJECT and here's why" — all in one place, with real data in MongoDB, real scores computed by the backend, and a dashboard that reflects the current state of the pipeline.

The one-sentence pitch to a judge: *"This turns messy startup evaluation into a structured, scored, auditable decision — not just another CRUD app."*

Everything you build should serve one of two things:
1. **Getting a startup's data into the system cleanly** (CRUD)
2. **Turning that data into a score → recommendation → decision** (the actual "intelligence" part)

If a feature does neither, it doesn't go in tomorrow's build.

---

## 2. Feature List

### 🔴 MANDATORY (this is 85%+ of your grade — build this first, make it bulletproof)
| Feature | Notes |
|---|---|
| Startup CRUD | Add / View / Edit / Delete |
| Search + Filter | By name, industry, stage minimum |
| Founder Evaluation form | 5 categories, 1–10 each, **auto-calculated average** (never let user type the overall score) |
| Investment Analysis form | Market, business model, competition, revenue, growth, risks, thesis |
| Decision recorder | Exactly 3 states: INVEST / WATCHLIST / REJECT + comment, timestamped |
| Dashboard | Total, Under Evaluation, Invested, Watchlist, Rejected, Avg Founder Score — **all computed from DB on request, nothing hardcoded** |
| REST API | Full CRUD + evaluation + analysis + decision + dashboard endpoints |
| Validation & error handling | Both client and server side |
| Responsive UI | Must not break on a laptop screen during judging |

### 🟡 DIFFERENTIATORS (build only after mandatory is 100% working — pick 3–4, not all 7)
Ranked by effort-to-impact ratio for a one-day build:

1. **Investment Scorecard + Overall Score** (cheap — it's just a weighted average of numbers you already have) — do this
2. **Decision Engine** (system recommendation via simple thresholds: ≥8 INVEST, 6–7.9 WATCHLIST, <6 REJECT) — do this, it's 20 lines of logic and huge visual/demo payoff
3. **Decision Explanation** ("Why this startup?" strengths/concerns auto-generated from thresholds on the same numbers) — do this, cheap because it reuses scorecard data
4. **Startup Comparison table** — do this if time allows, judges love comparing 2–3 startups side by side
5. Risk Radar — nice but skip if time-pressed; can be folded into the scorecard as one more scored row instead of a separate subsystem
6. Investment Pipeline Kanban — **skip unless everything else is done early**. Drag-and-drop kanban is a time sink for the visual payoff it gives
7. Investment Memo generator — do this **only as a template string**, not a new page. Render it as a printable summary section on the startup detail page

**Realistic differentiator target for one day: Scorecard + Decision Engine + Decision Explanation + Comparison.** That alone will visibly separate you from 90% of CRUD submissions.

### ⚪ OPTIONAL / DO NOT BUILD
- Auth/login system (unless mandatory doc requires it — it doesn't here; skip unless you finish everything else with hours to spare)
- Kanban drag-and-drop pipeline
- Any AI/LLM integration (explicitly not required — do not burn time on this)
- Payments, stock integration, scraping, social features — explicitly told not to build these
- Multi-user roles/permissions
- File uploads (pitch decks, logos) — looks nice, zero judging weight, real risk of eating hours on storage config

---

## 3. User Flow

```
Analyst logs in (skip if no auth) 
   → Dashboard (see pipeline health)
   → Add Startup (or open existing)
   → Startup Detail page
        → Fill Founder Evaluation → auto score
        → Fill Investment Analysis
        → View auto-generated Scorecard + System Recommendation
        → Record Analyst Decision (+ comment)
   → Back to Dashboard → numbers updated
   → Optionally: Compare 2–3 startups side by side
```

Keep the whole loop reachable in **under 10 clicks** from dashboard to decision — judges will actually try this.

---

## 4. Page / Screen Structure

Per the "don't create unnecessary pages" instruction, collapse into:

1. **Dashboard** (`/`) — stats + top opportunities + recent activity
2. **Startups List** (`/startups`) — table/cards, search, filter
3. **Startup Detail** (`/startups/:id`) — the workspace: overview, founder eval, analysis, scorecard, decision, memo — **all as sections on ONE page**, not separate routes
4. **Add/Edit Startup** (`/startups/new`, `/startups/:id/edit`) — modal or dedicated form page
5. **Compare** (`/compare?ids=a,b,c`) — pick 2–3 startups, side-by-side table

That's it — 5 routes. Resist the urge to make Founder Evaluation, Analysis, and Decision separate pages; they're tabs/sections inside Startup Detail.

---

## 5. Component Structure (React)

```
src/
  components/
    layout/          Navbar, Sidebar, PageContainer
    dashboard/        StatCard, TopOpportunities, RecentActivity
    startup/          StartupCard, StartupTable, StartupForm, SearchFilterBar
    evaluation/        FounderEvalForm, ScoreBadge, ScoreBar
    analysis/          AnalysisForm
    scorecard/         ScorecardPanel, RadarOrBarChart, RiskIndicator
    decision/          DecisionSelector, DecisionExplanation, MemoView
    comparison/        ComparisonTable
    common/            Loader, EmptyState, ErrorBanner, Modal, Badge
  pages/
    Dashboard.jsx
    StartupsList.jsx
    StartupDetail.jsx
    StartupFormPage.jsx
    Compare.jsx
  services/
    api.js            (axios instance)
    startupService.js
    evaluationService.js
    analysisService.js
    decisionService.js
    dashboardService.js
  hooks/
    useStartups.js, useStartupDetail.js
  utils/
    scoring.js         (shared score-calc helpers, mirror of backend logic for optimistic UI)
```

---

## 6. MongoDB Schema Design

Keep it to **one primary collection with embedded sub-documents** — this is a one-day hackathon, not a system-design interview. Over-normalizing across 5 collections will cost you hours in population/joins for zero judging benefit (Database Design is only 10%).

```js
// models/Startup.js
{
  companyName: String, required,
  industry: String, required,
  stage: { type: String, enum: ['Idea','Pre-seed','Seed','Series A','Series B+'] },
  founder: {
    name: String,
    background: String
  },
  website: String,
  location: String,
  description: String,

  evaluation: {
    experience: Number,      // 1-10
    domainExpertise: Number,
    execution: Number,
    vision: Number,
    teamStrength: Number,
    overallScore: Number,    // SERVER-COMPUTED, never accept from client
    updatedAt: Date
  },

  analysis: {
    marketOpportunity: String,
    marketScore: Number,     // 1-10, used in scorecard
    businessModel: String,
    businessModelScore: Number,
    competitiveLandscape: String,
    competitionScore: Number,
    revenue: String,
    growthPotential: String,
    growthScore: Number,
    keyRisks: String,
    riskScore: Number,       // 1-10, higher = riskier OR safer — pick one convention and document it
    investmentThesis: String
  },

  scorecard: {
    founderScore: Number,      // mirrors evaluation.overallScore
    marketScore: Number,
    businessModelScore: Number,
    growthScore: Number,
    competitionScore: Number,
    riskScore: Number,
    overallInvestmentScore: Number,   // SERVER-COMPUTED weighted avg
    systemRecommendation: { type: String, enum: ['INVEST','WATCHLIST','REJECT'] }
  },

  decision: {
    status: { type: String, enum: ['UNDER_EVALUATION','INVEST','WATCHLIST','REJECT'], default: 'UNDER_EVALUATION' },
    comment: String,
    decidedBy: String,     // plain text analyst name if no auth
    decidedAt: Date
  },

  pipelineStage: { type: String, enum: ['DISCOVERED','UNDER_REVIEW','EVALUATION','COMMITTEE','CLOSED'], default: 'DISCOVERED' },

  createdAt: Date,
  updatedAt: Date
}
```

**Why embedded, not referenced:** every read you'll actually perform (startup detail, dashboard aggregation, comparison) wants the whole document at once. Referencing would mean extra populate() calls for zero real benefit here. If you finish early and want to show "database design maturity," you can split `Evaluation` and `Analysis` into their own collections referencing `startupId` — but only as a stretch, not a blocker.

Optional second collection only if trivial to add: `Activity` (for the "Recent Activity" dashboard feed) — `{ startupId, message, createdAt }`, written whenever a startup is created/evaluated/decided.

---

## 7. API Architecture

```
GET     /api/startups                 ?search=&industry=&stage=&decision=
POST    /api/startups
GET     /api/startups/:id
PUT     /api/startups/:id
DELETE  /api/startups/:id

PUT     /api/startups/:id/evaluation      body: 5 scores → server computes + saves overallScore
PUT     /api/startups/:id/analysis        body: analysis fields + scores
PUT     /api/startups/:id/decision        body: { status, comment, decidedBy }
GET     /api/startups/:id/memo            server-generated summary object (or just return it as part of GET /:id)

GET     /api/dashboard                    aggregated stats (use Mongo aggregation or simple counts)
GET     /api/activity                     recent activity feed (optional)
```

**Response shape — keep consistent everywhere:**
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Startup not found" }
```

**Backend structure:**
```
server/
  models/Startup.js
  controllers/startupController.js
  controllers/dashboardController.js
  routes/startupRoutes.js
  routes/dashboardRoutes.js
  middleware/errorHandler.js
  middleware/validateRequest.js
  utils/scoring.js          <-- SINGLE SOURCE OF TRUTH for score math
  config/db.js
  server.js
  .env                      (MONGO_URI, PORT)
```

Put all scoring math in **one shared utils file**, imported by the evaluation and analysis controllers. Never duplicate the formula in two controllers — that's how you get a dashboard average that doesn't match the detail page.

---

## 8. Scoring Logic (exact formulas — decide these now, don't improvise mid-build)

**Founder Score:**
```
overallScore = (experience + domainExpertise + execution + vision + teamStrength) / 5
```

**Overall Investment Score** (weighted — pick weights and keep them fixed):
```
overallInvestmentScore =
    (founderScore      * 0.30) +
    (marketScore       * 0.20) +
    (businessModelScore* 0.15) +
    (growthScore       * 0.20) +
    (competitionScore  * 0.10) +
    (riskScore         * 0.05)
```
Round to 1 decimal. Document the weights somewhere visible (e.g., a tooltip) — judges asking "why these weights?" is a great sign they're engaged, and "it's a transparent, documented weighting we chose to emphasize founder + growth" is a strong answer.

**System Recommendation:**
```
>= 8.0        → INVEST
6.0 – 7.9     → WATCHLIST
<  6.0        → REJECT
```

**Decision Explanation (rule-based, not AI):**
- Any sub-score ≥ 8 → list as a Strength
- Any sub-score ≤ 5 → list as a Concern
- Confidence = HIGH if founderScore and overallInvestmentScore agree on direction and are both ≥7.5 or both <6; else MEDIUM

This is all `if/else` — resist any urge to call an LLM for this. The problem statement explicitly says AI is not mandatory, and rule-based logic is faster to build, faster to demo, and impossible to get "randomly wrong" in front of judges.

---

## 9. Dashboard Aggregation Query (example)

```js
const total = await Startup.countDocuments();
const invested = await Startup.countDocuments({ 'decision.status': 'INVEST' });
const watchlist = await Startup.countDocuments({ 'decision.status': 'WATCHLIST' });
const rejected = await Startup.countDocuments({ 'decision.status': 'REJECT' });
const underEvaluation = await Startup.countDocuments({ 'decision.status': 'UNDER_EVALUATION' });
const avgFounderScore = await Startup.aggregate([
  { $match: { 'evaluation.overallScore': { $exists: true } } },
  { $group: { _id: null, avg: { $avg: '$evaluation.overallScore' } } }
]);
```
This is real, DB-driven, and satisfies "must not be hardcoded" directly.

---

## 10. Development Roadmap (time-boxed for a ~24hr sprint)

| Time block | Task |
|---|---|
| Hour 0–1 | Repo init, MongoDB Atlas connection, Express skeleton, React skeleton, confirm both run and talk to each other (one test GET route) |
| Hour 1–3 | Startup model + full CRUD API, test every endpoint in Postman/Thunder Client before touching frontend |
| Hour 3–6 | Frontend: Startup list + search/filter + Add/Edit form, wired to real API |
| Hour 6–8 | Startup Detail page shell + Founder Evaluation form + backend evaluation endpoint (score auto-calc) |
| Hour 8–10 | Investment Analysis form + backend analysis endpoint |
| Hour 10–11 | Dashboard page wired to `/api/dashboard` |
| Hour 11–12 | **Checkpoint: everything mandatory must work end-to-end here.** If not, stop adding features and fix this. |
| Hour 12–14 | Decision recorder (Invest/Watchlist/Reject + comment) |
| Hour 14–16 | Scorecard calculation + System Recommendation (Decision Engine) |
| Hour 16–17 | Decision Explanation section (reuses scorecard data) |
| Hour 17–19 | Startup Comparison page |
| Hour 19–20 | Investment Memo section (template-based, on detail page) |
| Hour 20–22 | UI pass: cards, badges, progress bars, empty states, loading states, responsive check |
| Hour 22–23 | Bug bash — click every button, submit every form empty, refresh every page |
| Hour 23–24 | README, seed script with 8–10 realistic startups (never demo an empty DB), final commit, deploy or confirm local run instructions |

**Hard rule:** if you're not through Hour 12's checkpoint by the actual halfway point of your real remaining time, drop straight to "mandatory only" mode and skip differentiators except the Scorecard + Decision Engine (cheapest, highest payoff).

---

## 11. UI/UX Direction

- **Reference feel:** modern SaaS/fintech dashboard (think Notion + Linear + a VC dashboard) — not Bootstrap default.
- **Color system:** one primary brand color (deep blue/indigo works for "finance/trust"), semantic colors for decisions: green=INVEST, amber=WATCHLIST, red=REJECT — use these consistently everywhere (badges, table rows, chart bars) so a judge learns the color language instantly.
- **Typography:** one clean sans-serif (Inter/Manrope), clear hierarchy — big numbers for scores, small caps labels.
- **Score display:** always show as `X.X / 10` with a colored progress bar or badge, never as a bare number in plain text.
- **Cards over tables** for the startup list (more "product" feeling); a dense table is fine for Comparison.
- **Empty states matter:** "No startups yet — add your first one" beats a blank screen when a judge opens a fresh clone.
- **Loading states:** skeleton or spinner on every async fetch — an unresponsive-looking screen reads as "broken" to a judge even if it's just slow.

---

## 12. Common Hackathon Pitfalls (avoid these specifically)

- **Letting the frontend calculate and submit the "overall score."** The problem statement explicitly forbids manual entry — if a judge inspects your API payload and sees `overallScore` being sent from the client, that's an instant credibility loss. Compute it server-side, period.
- **Hardcoding dashboard numbers "temporarily" and forgetting to wire them up.** This is graded criteria explicitly — test it by adding a startup live during your own rehearsal and confirming the dashboard changes.
- **Building the Kanban pipeline before the core CRUD is solid.** Drag-and-drop is a classic hackathon time sink with mediocre judging payoff relative to effort.
- **Inconsistent API response shapes** across routes, forcing messy frontend code with different error handling per endpoint — pick one envelope shape (`{success, data}` / `{success, message}`) and stick to it everywhere.
- **No seed data.** A judge opening an empty app has nothing to click. Seed 8–10 realistic startups spanning all three decision states before your demo/submission.
- **Skipping validation "because it's a hackathon."** Missing basic validation is one of the fastest ways to crash the app live during judging when someone submits an empty form — 30 minutes of validation work now saves you a public crash later.
- **Trying to make every one of the 7 differentiator features "complete."** A judge would rather see 3 differentiators that work flawlessly than 7 that are half-broken. Depth beats breadth here.
- **Ignoring responsive design until the last hour.** Judging often happens on a shared/projected screen at odd resolutions — check your layout doesn't break at typical laptop widths early, not at Hour 23.
- **Over-engineering the database into 5+ collections with populate chains** — this eats hours for a criterion that's only worth 10%, while starving the 25%-weighted CRUD and 15%-weighted UI.
- **No error handling around API calls in React** — an unhandled promise rejection that blanks the screen on a network hiccup during a live demo is one of the most common ways hackathon demos visibly fail.
- **Not testing the actual submission instructions** (Git repo access, README run steps, env var setup) until the last 10 minutes. A project that judges can't even start scores zero regardless of quality.

---

## 13. What NOT to Build (confirmed out of scope — don't let scope creep in here)

- Payment processing / actual money movement
- Stock market or crypto integrations
- Web scraping for startup discovery
- Complex ML/AI models or LLM calls (explicitly optional/not required)
- Social features (comments between users, likes, sharing feeds)
- Multi-tenant auth/role systems (unless you finish everything else with real time to spare)
- File/document upload pipelines (pitch decks, logos) — nice-to-have with real infra cost, zero judging weight
- A fully drag-and-drop Kanban board — a simple stage badge/dropdown communicates pipeline position for 5% of the effort

---

## Next Step

Once you're ready to start coding, work through the roadmap in Section 10 in order — Phase 1 (Core CRUD) must be fully working and demo-able before touching any differentiator. Come back here whenever you're unsure whether a feature is worth building right now: if it's not in the "mandatory" table or the four chosen differentiators, it waits until everything above it is done.
