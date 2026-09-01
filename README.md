# 📈 Investly — Startup Investment Intelligence & Evaluation Platform

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-emerald.svg)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8.svg)
![Vite](https://img.shields.io/badge/Bundler-Vite-646cff.svg)

> **Investly** is an institutional-grade, full-stack **MERN** web platform engineered for angel syndicates, venture capital associates, and investment committees to discover, evaluate, risk-score, and track early-stage startups through progressive stage-gated diligence.

---

## 🎯 1. Problem Statement & How We Solved It Differently

### The Traditional Dilemma in Early-Stage VC Diligence:
1. **Subjective Guesswork**: Analysts pick arbitrary numbers out of thin air without empirical justification or links to actual partner meetings.
2. **Phantom Default Biases**: New startups are often pre-populated with random middle-of-the-road scores (e.g. `5.0/10`), corrupting pipeline portfolio analytics before diligence even begins.
3. **Disconnected Meeting Diligence**: Partner pitch notes, screening calls, and diligence takeaways live in disconnected Google Docs or Slack channels, detached from the quantitative scorecard.
4. **Unquantified Risk**: Risk evaluation is relegated to unstructured paragraphs that have zero mathematical impact on the final deal conviction score.
5. **Ungated Decision-Making**: Investment decisions are recorded prematurely without completing core founder and market diligence.

---

### 💡 Our Solution: The Hybrid Empirical & Pipeline-Gated Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                        INVESTLY DILIGENCE & SCORING PIPELINE                      │
├───────────────────────┬─────────────────────────┬─────────────────────────────────┤
│  1. SMART INTAKE      │  2. EVALUATION STUDIO   │  3. DECISION HEADQUARTERS       │
│  • Step Wizard        │  • 5-Star Qualities     │  • Readiness Diligence Gate     │
│  • CSV/Excel Importer │  • Meeting Rounds (1-10)│  • 100% Weighted Deal Score     │
│  • Clean State (0/10) │  • 4 Commercial Pillars │  • 1-Click Committee Action     │
│  • Auto-Discovered    │  • 5-Risk Auto Radar    │  • Real-Time Event Sync         │
└───────────────────────┴─────────────────────────┴─────────────────────────────────┘
```

1. **Dual-Track Founder Scoring Engine**: Blends normalized 5-star qualitative traits ($50\%$) with logged multi-round partner meeting scores ($50\%$).
2. **Zero Default Bias**: Unrated startups start completely clean (`0.0 / 10`), guaranteeing pipeline analytics integrity.
3. **Dynamic 5-Category Risk Radar**: High/Medium/Low risk toggles across 5 dimensions dynamically compute an empirical risk mitigation score.
4. **Guarded Committee Decision Headquarters**: Enforces completion of both Founder and Analytics diligence before unlocking 1-click committee votes (`INVEST` 🟢, `WATCHLIST` 🟡, `REJECT` 🔴).
5. **Event-Driven Live Synchronization**: Global event bus propagates evaluation updates to the Dashboard Overview and Comparison Matrix in real time.

---

## 📐 2. Mathematical Scoring Formulas & Engine Architecture

### A. Founder Performance Score ($30\%$ Overall Weight)
Combines structured founder traits with empirical partner meeting ratings:

$$\text{Star Score} = \left(\frac{\sum_{i=1}^5 \text{Star Rating}_i}{25}\right) \times 10 = \left(\frac{\text{Average Star}}{5}\right) \times 10$$

$$\text{Rounds Score} = \frac{\sum_{j=1}^N \text{Round Score}_j}{N}$$

$$\mathbf{Composite\; Founder\; Score} = (\text{Star Score} \times 0.50) + (\text{Rounds Score} \times 0.50)$$

* **5 Core Qualities**: Domain Expertise, Execution Speed, Vision & Ambition, Technical Depth, Leadership Quality.
* **Meeting Rounds Tracked**: Introductory Call, Screening Round, Technical Deep Dive, Partner Meeting, Due Diligence, Final Pitch.

---

### B. Commercial Analytics & Risk Mitigation ($70\%$ Combined Weight)
Evaluates market viability, traction, defensibility, and risk exposure:

1. **Market Size & TAM ($20\%$)**: Industry tailwinds, Total Addressable Market size, and expansion headroom.
2. **Growth & Traction ($20\%$)**: MRR/ARR velocity, customer MoM growth, and retention cohorts.
3. **Business Model Economics ($15\%$)**: Unit economics, LTV/CAC, margins, and payback periods.
4. **Competitive Moat ($10\%$)**: Network effects, IP, switching costs, and defensibility.
5. **Dynamic Risk Mitigation ($5\%$)**:

$$\text{Raw Risk Score} = \min\Big(10,\; (\text{High} \times 2.0) + (\text{Medium} \times 1.0) + (\text{Low} \times 0.2)\Big)$$

$$\mathbf{Risk\; Mitigation\; Score} = \max(0,\; 10 - \text{Raw Risk Score})$$

---

### C. Overall Weighted Investment Deal Score ($100\%$)
$$\begin{aligned}
\mathbf{Overall\; Deal\; Score} = &\; (\text{Founder Score} \times 0.30) \\
& + (\text{Market Score} \times 0.20) \\
& + (\text{Growth Score} \times 0.20) \\
& + (\text{Business Model Score} \times 0.15) \\
& + (\text{Competitive Moat Score} \times 0.10) \\
& + (\text{Risk Mitigation Score} \times 0.05)
\end{aligned}$$

---

### D. Automated System Recommendation Logic
$$\text{System Recommendation} = \begin{cases} 
\mathbf{INVEST\; 🟢} & \text{if } \text{Overall Score} \ge 7.5 \text{ (Term sheet ready)} \\ 
\mathbf{WATCHLIST\; 🟡} & \text{if } 6.0 \le \text{Overall Score} < 7.5 \text{ (Monitor 30–60 days)} \\ 
\mathbf{REJECT\; 🔴} & \text{if } \text{Overall Score} < 6.0 \text{ (Pass / Out of thesis)}
\end{cases}$$

---

## ✨ 3. Core Feature Walkthrough

### 1. 🔀 2-Way Sourcing & Intelligent Intake
* **Step-by-Step Manual Wizard**: 3-step progressive modal for Company Fundamentals, Founder Background, and Value Proposition with real-time validation.
* **Bulk CSV/Excel Importer**: Drag-and-drop spreadsheets with intelligent **fuzzy column mapping** (auto-detects `name`, `industry`, `stage`, `website`, `founder`, `location`) and pre-commit live table preview.

### 2. 👤 Unified Founder Diligence Studio
* Interactive 1–5 Star steppers for 5 core qualities with live 10-point normalization.
* Multi-round meeting logger with discussion takeaways and individual round ratings.
* Diligence checklist tracking 6 crucial founder traits (*Good Communication, Fast Learner, Hard Working, Honest & Open, Full-Time Focus, Team Player*) plus dynamic custom to-do creation.

### 3. 📊 Commercial Analytics & Dynamic Risk Radar
* 4 commercial quantitative pillars with decimal steppers and qualitative rationale inputs.
* 5-category Risk Radar (Founder, Market, Execution, Financial, Competitive).
* 1-Click **Investment Thesis Auto-Writer ✨** synthesizing metrics into an executive conviction memo.

### 4. ⚡ Guarded Committee Decision Headquarters
* **Diligence Readiness Gate**: Blocks decision recording until both Founder and Analytics diligence are completed, showing helpful direct navigation links.
* **1-Click Committee Vote**: Fast-select `INVEST` 🟢, `WATCHLIST` 🟡, or `REJECT` 🔴 with partner notes.
* Real-time `startup-created` event propagation that updates portfolio metrics across the entire application instantly.

### 5. 📈 Live Dashboard Overview
* **Portfolio Averages**: Live MongoDB aggregation computing average Founder and Overall scores exclusively over evaluated startups (unrated states default cleanly to `0.0 / 10`).
* **Top Scored Startups ($8.0+$ Threshold)**: Highlights top opportunities scoring $\ge 8.0$ with live status badges.
* Real-time pipeline counters (*Total Startups, In Pipeline, Invested, Watchlist, Rejected*).

### 6. 🔲 Deal Comparison Matrix (`/compare`)
* Launches in a clean blank state.
* Select 1 to 3 startups from interactive pipeline chips to review side-by-side founder depth, traction metrics, and committee verdicts.

---

## 🛠️ 4. Tech Stack & Architecture

### **Frontend**
* **Framework**: React 18 (Vite)
* **Routing**: React Router v7
* **Styling**: Tailwind CSS with custom typography & glassmorphism
* **Icons**: Lucide React
* **HTTP Client**: Axios with global response interceptors

### **Backend**
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB with Mongoose ODM (includes MongoDB Memory Server fallback for zero-config testing)
* **Architecture**: Modular MVC (Controllers, Models, Middleware, Routes, Utilities)

---

## 🚀 5. Getting Started & Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Step 1: Clone the Repository
```bash
git clone https://github.com/Mokshilxhah/Investly.git
cd Investly
```

### Step 2: Install Dependencies
Install all root, client, and server dependencies in one command:
```bash
npm run install:all
```

### Step 3: Configure Environment Variables (Optional)
The server runs out-of-the-box using an automated in-memory MongoDB instance if no `MONGO_URI` is supplied. To use your own MongoDB instance:
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/investly
NODE_ENV=development
```

### Step 4: Seed Benchmark Demo Startups (Optional)
Populate the database with pre-configured, realistic startups across diverse stages and sectors:
```bash
npm run seed
```

### Step 5: Start the Development Server
Launch both the backend API (Port `5000`) and the Vite frontend (Port `5173`) concurrently:
```bash
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 📡 6. REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/startups` | Fetch all startups with search, filter (industry/stage), and sorting. |
| `GET` | `/api/startups/:id` | Fetch single startup dossier by ID. |
| `POST` | `/api/startups` | Register a new startup (defaults to `Discovered`). |
| `PUT` | `/api/startups/:id` | Update company fundamentals and founder profile. |
| `DELETE` | `/api/startups/:id` | Delete startup record. |
| `POST` | `/api/startups/bulk` | Bulk import startups from spreadsheet matrix. |
| `PUT` | `/api/startups/:id/evaluation` | Save 5 qualities, meeting rounds, and calculate founder score. |
| `PUT` | `/api/startups/:id/analysis` | Save 4 pillars, 5 risk categories, and investment thesis. |
| `PUT` | `/api/startups/:id/decision` | Record committee vote (`INVEST`/`WATCHLIST`/`REJECT`) & partner notes. |
| `POST` | `/api/startups/:id/advance-stage`| Execute automated `canAdvance()` stage gating rules. |
| `GET` | `/api/pipeline` | Retrieve startups grouped by pipeline stage. |
| `GET` | `/api/pipeline/bottleneck` | Aggregates stage dwell times and pipeline bottleneck metrics. |
| `GET` | `/api/dashboard` | Aggregates portfolio averages, 8.0+ top scored deals, and activity feed. |

---

## 📂 7. Monorepo Project Structure

```
Investly/
├── client/                     # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/         # Modular UI Components
│   │   │   ├── common/         # Badges, Loaders, Modals
│   │   │   ├── layout/         # Sidebar, Navbar, Page Layout
│   │   │   └── startup/        # Table, Modals, ExcelUpload, Profile
│   │   ├── pages/              # Dashboard, StartupsList, Evaluation, Comparison
│   │   ├── services/           # Axios API Client
│   │   ├── App.jsx             # Route Definitions & State Bus
│   │   └── main.jsx            # React DOM Entrypoint
│   └── package.json
│
├── server/                     # Node.js + Express API Backend
│   ├── controllers/            # Controller Handlers (Startup, Dashboard)
│   ├── middleware/             # Error Handling & Request Logging
│   ├── models/                 # Mongoose Schema (Startup, Evaluation, Scorecard)
│   ├── routes/                 # Express Router Endpoints
│   ├── seed/                   # Database Seeder Scripts
│   ├── utils/                  # Mathematical Scoring & Stage Gating Algorithms
│   └── server.js               # Server Entrypoint
│
├── docs/                       # Technical Specifications & Architecture
│   ├── Phase 2 and Logic Implementation.md
│   └── solution_flowchart.md
│
├── package.json                # Root Monorepo Runner
└── README.md                   # Platform Documentation
```

---

## 🏆 8. Summary of Completed Deliverables

- [x] **Startup Management**: Full CRUD, 3-step wizard, smart CSV/Excel bulk importer, searchable/filterable directory.
- [x] **Founder Evaluation**: 5 Core Qualities Star Rating + Multi-Round Meeting Logger + 50/50 Composite Formula + Diligence Checklist.
- [x] **Commercial Analysis**: 4 Quantitative Commercial Pillars + Dynamic 5-Category Risk Radar + 1-Click Thesis Auto-Writer.
- [x] **Investment Decision**: Gated committee voting (`INVEST` / `WATCHLIST` / `REJECT`) with partner notes.
- [x] **Live Dashboard Overview**: Portfolio scoring averages, 8.0+ top scored startups filter, live stage counters, and activity feed.
- [x] **Deal Comparison Matrix**: 1-to-3 startup side-by-side evaluation comparison.
- [x] **Stage-Gating Engine**: Automated `canAdvance()` gate checks and stage history timeline tracking.
