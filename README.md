<div align="center">

# 📈 Investly

**A tool that helps investment teams decide which startups to fund — using real scores, not guesswork.**

![MERN](https://img.shields.io/badge/Stack-MERN-2ea44f?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

<br/>

## 🤔 What's the problem?

Right now, investment teams keep startup info everywhere — spreadsheets, emails, chats, docs. Nothing is in one place, and nobody scores things the same way.

```mermaid
flowchart LR
    A[📊 Spreadsheets] --> Z((😵‍💫 Messy Process))
    B[📧 Emails] --> Z
    C[💬 Chat Messages] --> Z
    D[📄 Random Docs] --> Z
    Z --> E[❌ Inconsistent Decisions]
```

<br/>

## 💡 What does Investly do instead?

One pipeline. A startup moves forward **only if its score is good enough**. If it's not, it gets stuck — and the app tells you exactly why.

```mermaid
flowchart TD
    A["🔍 Discovered<br/>Add the startup's basic info"] --> B["📝 Screening<br/>Score the founder"]
    B --> C{"Founder score<br/>5 or higher?"}
    C -- No --> B
    C -- Yes --> D["🔬 Deep Dive<br/>Check market, growth, risks"]
    D --> E{"Overall score 6+<br/>and no major risk?"}
    E -- No --> D
    E -- Yes --> F["🏛️ Committee<br/>Write the pitch, take a vote"]
    F --> G(["✅ Closed<br/>Invest / Watchlist / Reject"])
```

**In plain words:** you can't reach a final decision by skipping steps. The numbers have to actually earn it.

<br/>

## 🧮 How scoring works

```mermaid
flowchart LR
    F["👤 Founder Score<br/>(30%)"] --> O["⭐ Overall Score"]
    M["🌍 Market Score<br/>(20%)"] --> O
    G["📈 Growth Score<br/>(20%)"] --> O
    B["💰 Business Model<br/>(15%)"] --> O
    C["🛡️ Competition<br/>(10%)"] --> O
    R["⚠️ Risk Score<br/>(5%)"] --> O
    O --> D{"Where does<br/>it land?"}
    D -->|"7.5 or higher"| I["🟢 INVEST"]
    D -->|"6.0 – 7.4"| W["🟡 WATCHLIST"]
    D -->|"below 6.0"| X["🔴 REJECT"]
```

**Two extra safety rules:**
- A startup never starts with a fake "average" score — it starts at **zero** until someone actually evaluates it.
- If founder risk is rated "High," the system blocks an INVEST recommendation no matter how good the rest of the score looks. One bad red flag can outweigh a good average — just like a real investor would think.

<br/>

## ⚙️ How the app is built

```mermaid
flowchart LR
    U["🧑‍💻 You, in the browser"] -->|clicks around| R["⚛️ React (frontend)"]
    R -->|sends requests| E["🚂 Express (backend)"]
    E -->|reads & writes| M[("🍃 MongoDB")]
    E -->|sends data back| R
```

Nothing is faked — every number on screen comes from a real database call.

<br/>

## ✨ What you can actually do in the app

- ➕ **Add a startup** — quick 3-step form, or upload a spreadsheet to add many at once
- 👤 **Score the founder** — rate 5 qualities + log meeting notes
- 📊 **Analyze the business** — market size, growth, competition, risks
- 🚦 **Watch it move through the pipeline** — see exactly which stage every startup is in
- 🏛️ **Make the final call** — Invest, Watchlist, or Reject, with a comment explaining why
- 🔲 **Compare startups side-by-side** — pick up to 3 and see how they stack up
- 📈 **Check the dashboard** — live counts, top opportunities, recent activity

<br/>

## 🚀 Getting it running

```bash
git clone https://github.com/Mokshilxhah/Investly.git
cd Investly
npm run install:all
npm run seed      # optional — adds sample startups so it's not empty
npm run dev        # starts both frontend and backend together
```

Then open **`http://localhost:5173`** in your browser. That's it — no setup needed, it uses a built-in database by default.

<br/>

## 📂 Where things live

```
Investly/
├── client/     → everything you see (React)
├── server/     → the logic and database (Express + MongoDB)
└── docs/       → notes on how the scoring works
```

<br/>

## ✅ What's done

| Piece | Status |
|---|:---:|
| Add / edit / delete startups | ✅ |
| Score the founder | ✅ |
| Analyze the business + risks | ✅ |
| Pipeline stages that actually gate progress | ✅ |
| Live dashboard | ✅ |
| Compare startups | ✅ |

<br/>

<div align="center">

Thank You ❤️

</div>
