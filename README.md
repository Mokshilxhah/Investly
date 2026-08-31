# 📈 Investly — Startup Investment Intelligence & Intake Platform

Investly is a modern, high-performance platform designed for angel investors, venture capital analysts, and syndicate leads to track, evaluate, and intake startups into their deal pipeline.

---

## ✨ Key Features

### 1. 🔀 2-Phase Intake Engine
- **Manual Intake (`3-Step Stepper`)**:
  - Step 1: Company Fundamentals *(Name, Industry, Stage, Location, Website)*.
  - Step 2: Founder Profile & Track Record.
  - Step 3: Value Proposition Overview & Interactive Clickable Review.
  - Features top graphical indicator bars and strict disabled-next validation per step.
- **Bulk Excel / CSV Direct Dropzone**:
  - Accepts standard templates or raw, unorganized spreadsheets (even 2 columns: *Company Name + Website*).
  - Smart heuristic URL recognition and auto-fallback for missing fields.
  - Interactive **Column Mapping Bar** and live editable pre-import preview table.
  - High-performance batch creation via atomic `POST /api/startups/bulk`.

### 2. 📊 Structured Startup Directory
- Clean, responsive data table with company monograms, verification links, founder track record snippets, and location metadata.
- Instant keyword search across names, founders, sectors, and locations.
- Real-time industry and stage filters with multi-attribute sorting (A-Z, Newest, Oldest).
- Fast inline **Edit**, **Delete**, and full **Profile Preview Modals**.

### 3. 🎯 Real-Time Dashboard & Analytics
- 5-KPI Bento Grid *(Total Startups, Evaluating, Invested, Watchlist, Rejected)* with zero-state structure retention.
- Top Scored Startups showcase and Portfolio Scoring Averages.
- Industry Breakdown with animated percentage visual distribution.

### 4. 🏢 Dedicated Startup Workspace (`/startups/:id`)
- Comprehensive startup dossier with company value proposition, founder background, and pipeline tracking.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router v7, Axios
- **Backend**: Node.js, Express, Mongoose (MongoDB ODM)
- **Database**: MongoDB / MongoDB Memory Server
- **Architecture**: Monorepo with concurrently script orchestration

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/Mokshilxhah/Investly.git
cd Investly
npm run install:all
```

### 2. Run Locally
Start both backend (Port `5000`) and frontend (Vite) simultaneously:
```bash
npm run dev
```
The client will be running at `http://localhost:5173` and automatically proxy API requests to `http://localhost:5000`.

### 3. Seed Sample Data (Optional)
To populate the database with initial benchmark startups:
```bash
npm run seed
```

---

## 📂 Project Structure

```
Investly/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI & Startup Modals
│   │   │   ├── common/         # Badges, Loaders, Modals
│   │   │   ├── layout/         # Sidebar, Header, Layout
│   │   │   └── startup/        # Table, Modal, ExcelUpload, Profile
│   │   ├── pages/              # Dashboard, StartupsList, StartupDetail
│   │   └── services/           # Axios API Client & Startup Endpoints
│   └── package.json
│
├── server/                     # Backend API Server
│   ├── controllers/            # Startup CRUD & Bulk Import Handlers
│   ├── middleware/             # Validation & Error Handlers
│   ├── models/                 # Mongoose Startup Schema
│   ├── routes/                 # Express API Routes
│   ├── utils/                  # Scoring & Intelligence Algorithms
│   └── server.js               # Express Server Entry Point
│
├── .gitignore                  # Git Ignore Configuration
├── package.json                # Root Monorepo Runner
└── README.md                   # Platform Documentation
```

---

## 📄 License
This project is licensed under the ISC License.
