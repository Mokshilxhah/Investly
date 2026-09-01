# Phase 2 Architecture & Logic Implementation Specification

---

## 🌟 1. Executive Philosophy: How We Solved VC Diligence Differently

Traditional venture capital evaluation tools suffer from five fundamental flaws:
1. **Subjective Guesswork vs. Concrete Data**: Analysts enter arbitrary numbers without tying them to empirical founder interactions or structured diligence.
2. **Phantom Default Biases**: New startups are often pre-populated with random scores or middle-of-the-road averages (e.g. 5/10), distorting pipeline analytics before diligence even begins.
3. **Disconnected Meeting Diligence**: Partner meetings, pitch notes, and diligence calls exist in disconnected docs or emails, separated from the quantitative scorecard.
4. **UI Clutter & Cognitive Overload**: Massive paragraphs of dense text and redundant inputs slow down deal flow and executive review.
5. **Ungated Decision-Making**: Premature investment decisions are recorded before core diligence is completed, resulting in flawed committee outcomes.

### 💡 Our Solution: The Hybrid Empirical & Pipeline-Gated Architecture
We engineered a **human-centered, progressive diligence cockpit** that combines:
* **Dual-Track Founder Scoring**: Blends structured 5-star qualitative traits ($50\%$) with empirical multi-round meeting data ($50\%$).
* **Mathematical Risk Mitigation**: Converts qualitative risk assessments across 5 categories into an auto-calculated risk impact score.
* **Guarded Committee Decision Headquarters**: Enforces complete diligence before unlocking 1-click committee votes.
* **Live Event-Driven Dashboard Synchronization**: Instantly propagates score and stage updates to portfolio metrics with zero reload lag.
* **Zero Default Bias**: Every new startup enters in a clean, unrated state (`0.0 / 10`), guaranteeing complete analytical integrity.

---

## 🧭 2. Two Stages Architecture: Funding Stage vs. Pipeline Stage

To prevent operational collisions, the system maintains a strict separation between where a company is in its capital lifecycle versus where it sits in internal diligence:

| Field | Values | System Purpose |
|---|---|---|
| `stage` (Funding Stage) | `Idea`, `Pre-seed`, `Seed`, `Series A`, `Series B+` | The company's external financing round. Used for peer benchmarking and diligence context. |
| `pipelineStage` (Internal Diligence) | `Discovered`, `Screening`, `Deep Dive`, `Committee`, `Closed` | The startup's internal progression in the investment pipeline. |

---

## 👤 3. Tab 1: Founder Evaluation Architecture (50%–50% Dual Engine)

Founder Evaluation in the Studio combines qualitative diligence with quantitative meeting history into a single, unified scoring model:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FOUNDER EVALUATION WORKSPACE                       │
├───────────────────────────────────┬─────────────────────────────────────┤
│   A. 5 Core Qualities (50%)       │   B. Meeting Rounds Diligence (50%) │
│   • Domain Expertise   (1-5 ⭐)   │   • Intro Call       [ 7.5 / 10 ]   │
│   • Execution Speed    (1-5 ⭐)   │   • Screening Round  [ 8.0 / 10 ]   │
│   • Vision & Ambition  (1-5 ⭐)   │   • Technical Deep   [ 8.5 / 10 ]   │
│   • Technical Depth    (1-5 ⭐)   │   • Partner Pitch    [ 8.0 / 10 ]   │
│   • Leadership Quality (1-5 ⭐)   │   Average Round Score = 8.0 / 10    │
│   Normalized Score = 8.4 / 10     │                                     │
├───────────────────────────────────┴─────────────────────────────────────┤
│   C. Actionable Diligence Checklist (6 Human-Friendly Traits + Custom)  │
│   [✓] Fast Learner  [✓] Honest & Open  [✓] Full-Time Focus  [✓] Team    │
├─────────────────────────────────────────────────────────────────────────┤
│   FORMULA: Final Founder Score = (Star Score × 0.5) + (Rounds Avg × 0.5)│
│                        >>> 8.2 / 10 (Persisted) <<<                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### A. 5 Core Qualities (1–5 Star Rating with 10-Point Normalization)
Each quality is scored on an interactive 1 to 5 star scale (with decimal stepper support):
1. **Domain Expertise**
2. **Execution Speed**
3. **Vision & Ambition**
4. **Technical Depth**
5. **Leadership Quality**

$$\text{Star Score (out of 10)} = \left(\frac{\sum \text{Stars}}{5 \times 5}\right) \times 10 = \left(\frac{\text{Average Star Rating}}{5}\right) \times 10$$

### B. Empirical Meeting Rounds Tracker
Analysts log distinct diligence meetings (`Introductory Call`, `Screening Round`, `Technical Deep Dive`, `Partner Meeting`, `Due Diligence`, `Final Committee Pitch`, `Follow-up Q&A`) with individual discussion notes and numerical ratings (1–10):

$$\text{Average Round Score} = \frac{\sum \text{Logged Round Scores}}{\text{Total Rounds Logged}}$$

### C. 50% - 50% Composite Weightage Formula
$$\text{Composite Founder Score} = (\text{Star Score} \times 0.50) + (\text{Average Round Score} \times 0.50)$$

*(If only star ratings or only meeting rounds are logged, the score computes dynamically from the active dimension without skewing).*

### D. Qualitative Diligence Checklist
Provides instant, binary verification of crucial founder intangibles:
* Good Communication
* Fast Learner
* Hard Working
* Honest & Open
* Full-Time Focus
* Team Player
*(Custom to-dos can be added and verified dynamically with session persistence).*

### E. Zero Default Bias
New startups start in a clean state (`0/5 ⭐`, `0 rounds logged`, `0/6 verified`, score: `— / 10`).

---

## 📊 4. Tab 2: Commercial Analytics & Dynamic Risk Radar

The Commercial Analytics tab evaluates market viability, traction, defensibility, and risk exposure:

### A. 4 Commercial Pillars ($65\%$ Combined Weight)
1. **Market Size & TAM ($20\%$)**: Industry tailwinds, Total Addressable Market, and expansion space.
2. **Growth & Traction ($20\%$)**: MRR/ARR trajectory, MoM customer growth, and retention cohorts.
3. **Business Model Economics ($15\%$)**: Unit economics, LTV/CAC, margins, and payback periods.
4. **Competitive Moat ($10\%$)**: Network effects, IP, switching costs, and differentiation.

### B. Dynamic Auto-Calculating Risk Radar ($5\%$ Weight)
Instead of subjective guesses, the Risk Radar evaluates 5 critical risk dimensions:
* **Founder Risk** (`LOW` 🟢 | `MED` 🟡 | `HIGH` 🔴)
* **Market Risk** (`LOW` 🟢 | `MED` 🟡 | `HIGH` 🔴)
* **Execution Risk** (`LOW` 🟢 | `MED` 🟡 | `HIGH` 🔴)
* **Financial Risk** (`LOW` 🟢 | `MED` 🟡 | `HIGH` 🔴)
* **Competitive Risk** (`LOW` 🟢 | `MED` 🟡 | `HIGH` 🔴)

#### Dynamic Risk Calculation Formula:
$$\text{Raw Risk Score} = \min\Big(10,\; (\text{High Counts} \times 2.0) + (\text{Medium Counts} \times 1.0) + (\text{Low Counts} \times 0.2)\Big)$$

$$\text{Risk Mitigation Score} = \max(0,\; 10 - \text{Raw Risk Score})$$

* **Low Risk**: $\le 3.0$
* **Moderate Risk**: $3.1 - 6.0$
* **High Risk**: $> 6.0$

### C. 1-Click Investment Thesis Auto-Writer
Synthesizes founder performance, traction metrics, and risk tiering into an executive investment conviction memo.

---

## ⚡ 5. Tab 3: Summary & Fast Executive Verdict Cockpit

Tab 3 serves as the **Investment Committee Decision Headquarters**, distilling both tabs into an ultra-fast, minimal, and high-impact visual decision memo:

### A. Overall Deal Score Formula (100% Weighted Matrix)
$$\begin{aligned}
\text{Overall Deal Score} = &\; (\text{Founder Score} \times 0.30) \\
& + (\text{Market Score} \times 0.20) \\
& + (\text{Growth Score} \times 0.20) \\
& + (\text{Business Model Score} \times 0.15) \\
& + (\text{Moat Score} \times 0.10) \\
& + (\text{Risk Mitigation Score} \times 0.05)
\end{aligned}$$

### B. Automated System Recommendation Engine
* **INVEST** 🟢: $\text{Overall Score} \ge 7.5$ (Strong conviction, term sheet ready)
* **WATCHLIST** 🟡: $6.0 \le \text{Overall Score} < 7.5$ (Monitor milestones for 30–60 days)
* **REJECT** 🔴: $\text{Overall Score} < 6.0$ (Does not meet current fund thesis)

### C. Diligence Gate: Enforced Pre-requisite Check
To guarantee committee rigor, **decision making is strictly locked** until both prerequisites are met:
* `hasFounderScore = compositeFounderScore > 0`
* `hasAnalyticsScore = avgAnalyticsScore > 0`

If either section is incomplete:
* The decision action bar is replaced with an **"Evaluation Incomplete"** callout.
* Quick-action buttons (*`Score Founder →`* and *`Score Analytics →`*) navigate directly to the missing section.
* The save handler rejects premature submissions.

### D. 1-Click Decision Recording & Real-Time Sync
* 3 Large Fast Selectors: `🟢 INVEST` • `🟡 WATCHLIST` • `🔴 REJECT`.
* Compact 1-line partner decision notes.
* Instant database persistence (`PUT /api/startups/:id/decision`) and dispatch of `startup-created` events to synchronize portfolio metrics across the application in real time.

---

## 📈 6. Live Dashboard Overview Engine

The Dashboard Overview was upgraded to eliminate phantom defaults and reflect live evaluation activity:

1. **Portfolio Averages Live Calculation**:
   * Aggregates only startups with active evaluations ($\text{score} > 0$).
   * Unrated startup states default cleanly to **`0.0 / 10`**.
2. **Top Scored Startups ($8.0+$ Threshold)**:
   * Displays exclusively high-performing opportunities with an overall deal score $\ge 8.0$.
   * Shows a clean empty state (*"No 8.0+ Evaluated Startups Yet"*) when no startup has crossed the conviction bar.
3. **Live Pipeline Sync**:
   * Synchronized real-time counts for **In Pipeline**, **Invested**, **Watchlist**, and **Rejected**.

---

## 🔲 7. Deal Comparison Matrix (`/compare`)

* **Clean Blank Default State**: Launches clean without forced pre-selections.
* **Multi-Startup Selection**: Analysts pick 1 to 3 startups via interactive chips to evaluate live founder scores, commercial traction, business models, and committee verdicts side by side.

---

## 🛡️ 8. Backend Pipeline Gatekeeper & API Endpoints Reference

### Pipeline Progression Rules (`canAdvance()`)
```javascript
// server/controllers/startupController.js
function canAdvance(startup) {
  switch (startup.pipelineStage) {
    case 'Discovered':
      return { allowed: true }; // Always allowed to enter screening
    case 'Screening':
      if (!startup.evaluation?.overallScore || startup.evaluation.overallScore < 5.0) {
        return { allowed: false, reason: 'Founder score must be at least 5.0/10 to enter Deep Dive.' };
      }
      return { allowed: true };
    case 'Deep Dive':
      if (startup.scorecard?.riskVetoTriggered) {
        return { allowed: false, reason: startup.scorecard.riskVetoReason };
      }
      if (!startup.scorecard?.overallInvestmentScore || startup.scorecard.overallInvestmentScore < 6.0) {
        return { allowed: false, reason: 'Overall score must be at least 6.0/10 to reach Committee.' };
      }
      return { allowed: true };
    case 'Committee':
      return { 
        allowed: startup.decision?.status && startup.decision.status !== 'UNDER_EVALUATION',
        reason: 'A final investment decision must be recorded to close.' 
      };
    default:
      return { allowed: false, reason: 'Startup is already closed.' };
  }
}
```

### Core API Endpoints:
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/startups` | Creates a new startup defaulting to `Discovered` with clean unrated schema. |
| `POST` | `/api/startups/bulk` | Bulk imports spreadsheets with automatic fuzzy column mapping and enum sanitization. |
| `PUT` | `/api/startups/:id/evaluation` | Persists 5 qualities, meeting rounds, and calculates composite founder score. |
| `PUT` | `/api/startups/:id/analysis` | Persists 4 pillars, 5 risk categories, auto-calculates risk mitigation, and saves investment thesis. |
| `PUT` | `/api/startups/:id/decision` | Records committee vote (`INVEST`/`WATCHLIST`/`REJECT`), notes, and advances stage to `Closed` if in Committee. |
| `POST` | `/api/startups/:id/advance-stage` | Runs automated `canAdvance()` gate checks and updates `stageHistory` timeline. |
| `GET` | `/api/pipeline` | Returns startups grouped by stage (`Discovered`, `Screening`, `Deep Dive`, `Committee`, `Closed`). |
| `GET` | `/api/pipeline/bottleneck` | Aggregates stage dwell times and identifies pipeline bottlenecks. |
| `GET` | `/api/dashboard` | Aggregates portfolio averages, 8.0+ top scored startups, pipeline counts, and recent activity. |

---

## 🎯 9. Phase 2 Verification & Validation Summary

| Component | Status | Verified Behavior |
|---|---|---|
| **Founder 50-50 Engine** | ✅ Complete | Evaluates 5 star qualities + meeting rounds with 10-point normalization and checklist tracking. |
| **Commercial Analytics** | ✅ Complete | Evaluates 4 pillars, auto-calculates risk radar score, and writes synthesized thesis. |
| **Gated Verdict Cockpit** | ✅ Complete | Locks committee vote until both sections are scored; saves decision with 1-click speed. |
| **Live Dashboard Metrics** | ✅ Complete | Zero default bias (`0.0/10`), $8.0+$ threshold filter, live event syncing. |
| **Comparison Matrix** | ✅ Complete | Starts blank; compares 1–3 startups across live scores and verdicts. |
| **Backend Gatekeeper** | ✅ Complete | Enforces stage gating, enum normalization, and timeline tracking. |
