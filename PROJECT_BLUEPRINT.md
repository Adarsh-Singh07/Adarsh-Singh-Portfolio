# 📐 System Design & Codebase Blueprint

This blueprint describes the codebase architecture, file topology, and system engineering of Adarsh Singh's personal portfolio. It acts as a guide to help developers and recruiters navigate the workspace structure and understand how the frontend components and backend services interact.

---

## 📂 Codebase Directory Topology

A structured view of the key directories and files in this monorepo:

```
Adarsh-Singh-Portfolio/
├── .github/workflows/          # CI/CD Pipeline Automation
│   └── ci-cd.yml               # Unified GitHub Actions deployment workflow
├── backend/                    # FastAPI (Python) Backend Service
│   ├── data/                   # Knowledge Base & SQLite database storage
│   │   ├── cv.txt              # Raw CV text (RAG source document)
│   │   ├── profile.json        # Dynamic portfolio persona metadata
│   │   └── portfolio.db        # SQLite database (Ignored by Git, mounts via GCS FUSE)
│   ├── main.py                 # FastAPI Application entry point & Middlewares
│   ├── chatbot.py              # Gemini LLM conversational endpoint
│   ├── rag.py                  # Semantic search indexing and context retrieval
│   ├── db.py                   # SQLite tables initialization & DB query helpers
│   ├── mail_helper.py          # SMTP & Resend API dispatchers (Dual-response mail flow)
│   └── Dockerfile              # Containerization recipe for Google Cloud Run
├── frontend/                   # React + TypeScript SPA (Vite)
│   ├── public/                 # Static assets (Favicons, PDFs, SVGs)
│   ├── src/                    # React codebase
│   │   ├── components/         # Reusable widgets (Navbar, Chatbot, Theme/Role toggles)
│   │   ├── pages/              # Primary route pages (Home, Projects, Skills, Timeline, Dashboard)
│   │   ├── data/               # Local fallback data models
│   │   ├── services/           # HTTP API client to connect to Backend
│   │   ├── types/              # TypeScript interfaces and type definitions
│   │   ├── App.tsx             # Main App Router, transitions & Google Analytics hook
│   │   └── index.css           # Global typography, color schemes, and custom animations
│   ├── tailwind.config.js      # Utility styling tokens (v4 engine)
│   └── vite.config.ts          # Frontend build configuration & API dev proxy
├── firebase.json               # Firebase Hosting routing & API rewrite rule config
└── README.md                   # Project overview and setup instructions
```

---

## 🎨 Design System & Theme Engine

The application features a cinematic, high-contrast, premium aesthetic that transitions fluidly between two states:
-   🌑 **Obsidian Deep Dark**: `#050505` background with soft indigo/cyan ambient backlights, glassmorphic floating pills, and titanium text colors.
-   ☀️ **Titanium Elegant Light**: Slate-50 background with platinum gradients and high-contrast charcoal text.

### Framer Motion Transition Specifications
To prevent jarring layout shifts between pages, all transitions run through a centralized `AnimatePresence` wrapper:
*   **Entrance**: `opacity: 0, y: 12` ➡️ `opacity: 1, y: 0`
*   **Exit**: `opacity: 1, y: 0` ➡️ `opacity: 0, y: -8`
*   **Timing Curve**: Easing: `[0.16, 1, 0.3, 1]` (custom ease-out), Duration: `0.35s`

---

## 🧩 Architectural Subsystems

### 1. The Persona Switching Engine
*   **Concept**: Instead of hosting static pages, the portfolio has a **dynamic role toggle**. It re-shapes the entire website's context depending on whether the user selects **General AI/Data**, **Data Engineer**, or **Gen AI Engineer**.
*   **Flow**:
    1. Clicking a role in the navbar calls `/api/v1/portfolio/profile?mode=<role>`.
    2. The frontend dynamically swaps sections, technology grids, project lists, and philosophy cards.
    3. If the backend is offline, the service gracefully falls back to local data objects (`profileModes.ts`) to ensure 100% uptime.

### 2. Grounded RAG Chatbot ("Addy")
*   **Concept**: Addy acts as Adarsh's digital assistant. To prevent hallucination, it uses **Retrieval-Augmented Generation (RAG)**.
*   **Flow**:
    1. During startup, `rag.py` checks if `cv.txt` or `profile.json` has changed by comparing MD5 hashes.
    2. If changed, it splits the text, generates vector embeddings using Gemini, and stores them in SQLite.
    3. When a user asks a question, `rag.py` computes cosine similarity, retrieves the top 4 matching chunks, and injects them as grounding context into the system instructions for Gemini.
    4. If the bot is asked about Adarsh and lacks the info, it marks the response as `[UNANSWERED]` and writes the question to `unanswered_questions` in the database so Adarsh can review it on the dashboard.

### 3. Dual-Channel Outreach & Intent Router
*   **Concept**: When recruiters fill out the contact form, their message is analyzed and dispatched through a secure dual-channel pipeline.
*   **Flow**:
    1. The API endpoint routes the message to Gemini to categorize the sender's intent (`Hiring Inquiry`, `Collaboration`, `General Question`, or `Other`).
    2. It saves the categorized lead in SQLite.
    3. It triggers a background task that:
        *   Sends an admin notification to Adarsh (tries **Resend API**, falls back to **Gmail SMTP**).
        *   Sends a beautifully formatted HTML auto-responder email to the visitor confirming their details.

### 4. Telemetry & Observability Dashboard
*   **Concept**: A secure dashboard (`/dashboard`) that tracks real-time operations of the website.
*   **Metrics Tracked**:
    *   **Traffic telemetry**: Active chat sessions and lead conversion counts.
    *   **LLM Metrics**: API call latency (ms), prompt/response token usage, and cumulative cost estimation.
    *   **Feedback**: Aggregated positive and negative feedback ratings on chatbot answers.
*   **Security**: Access to read raw message content is locked behind a header passcode verified via secure `HMAC` comparison on the backend.
