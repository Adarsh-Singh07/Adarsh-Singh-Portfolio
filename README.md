# 🚀 Adarsh Singh — Premium AI & Data Engineering Portfolio

A cinematic, dynamic, and intelligence-driven personal portfolio showcasing expert capabilities in **Generative AI, Data Engineering, RAG Systems, and Cloud Architectures**.

This repository contains a **React + TypeScript** frontend styled with **TailwindCSS** and powered by **Framer Motion** for fluid, immersive transitions, backed by a robust **FastAPI (Python)** server that supports AI-powered lead classification, an observability analytics dashboard, and a RAG-grounded conversational AI assistant.

---

## 🏗️ Architectural Topology

```
                       +---------------------------------------+
                       |           Firebase Hosting            |
                       |    (Static Web Assets, React SPA)     |
                       +-------------------+-------------------+
                                           |
                              (API requests: /api/**)
                                           v
                       +---------------------------------------+
                       |         Google Cloud Run              |
                       |      (FastAPI Python Backend)         |
                       +-------+-----------------------+-------+
                               |                       |
                               | (Mounts via FUSE)     | (API Call)
                               v                       v
                 +---------------------------+   +-----------+
                 |    Cloud Storage Bucket   |   |  Gemini   |
                 | (SQLite DB: portfolio.db) |   |  2.5 API  |
                 +---------------------------+   +-----------+
```

---

## ⚡ Core Features

- 🎭 **Role-Adaptive Layouts**: Seamlessly toggles the entire website persona, content, grids, and engineering philosophy between **General AI/Data**, **Data Engineering**, and **Gen AI Engineering** modes.
- 🤖 **Addy: RAG AI Assistant**: An interactive digital twin of Adarsh, powered by Gemini and grounded on a local knowledge base (`cv.txt` and `profile.json`). Features semantic retrieval, automatic unanswered question logging, and lead-generation extraction.
- 📈 **Developer Observability Analytics**: A secure dashboard that visualizes real-time metrics including total chat sessions, LLM API latency, token consumption, total cost estimates, user feedback stats, and contact outreach messages.
- 📨 **High-Trust Outreach Gateway**: Contact form with automated email dispatching. Uses **Resend API** with fallback to **Gmail SMTP** for both admin alerts and premium HTML auto-responders to visitors. Includes automatic message intent categorization via Gemini.
- 💾 **Serverless GCS FUSE Persistence**: Cloud Run deployment utilizes Cloud Storage FUSE to mount a folder at `/app/data`, allowing a zero-cost SQLite database to persist across container scaling and restarts.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript (built with Vite)
- **Styling**: TailwindCSS (v4)
- **Animations**: Framer Motion (smooth, blur, and scale route transitions)
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **AI Integrations**: Google GenAI SDK (Gemini 2.5 Flash)
- **Database**: SQLite (SQLAlchemy / direct sqlite3 connection optimized for GCS FUSE)
- **Routing & Verification**: Pydantic v2, HMAC passcode checking
- **Mailers**: Resend HTTP Client / smtplib

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory to store sensitive credentials (automatically excluded from Git tracking via `.gitignore`):

```bash
# Gemini API Key (Required for Chatbot & Auto-Categorization)
GEMINI_API_KEY="AIzaSy..."
# Backup Gemini API Key (Optional - for high-availability fallback)
BACKUP_GEMINI_API_KEY="AIzaSy..."

# Admin Access Passcode (For developer dashboard authentication)
ADMIN_PASSCODE="your_secure_passcode"

# Allowed CORS Origins (Comma-separated URLs in production)
ALLOWED_ORIGINS="https://your-app.web.app,https://your-app.firebaseapp.com"

# --- SMTP Configuration (Fallback Mailer) ---
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-specific-password"
SMTP_TO="your-email@gmail.com"

# --- Resend API Configuration (Primary Mailer) ---
RESEND_API_KEY="re_..."
RESEND_FROM="onboarding@resend.dev"
```

---

## 💻 Local Quickstart

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup
Navigate to the `backend/` directory:
```bash
cd backend
# Create a virtual environment
python -m venv .venv
# Activate virtual environment (Windows)
.venv\Scripts\activate
# Activate virtual environment (macOS/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Launch the FastAPI development server:
```bash
uvicorn main:app --reload --port 8000
```
The API documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
Navigate to the `frontend/` directory:
```bash
cd frontend
# Install dependencies
npm install
# Start Vite development server
npm run dev
```
Open `http://localhost:3000` in your browser. The frontend is configured to proxy all `/api` calls to the local FastAPI port (`8000`).

---

## 🛡️ Security & Privacy Standards

To make this codebase safe for public hosting on GitHub, the following protocols have been configured:
1. **Zero Hardcoded Secrets**: All keys, emails, SMTP credentials, and passcodes are parsed at runtime from environment variables using `dotenv`. A `.env.example` file is provided as a template.
2. **Robust `.gitignore`**: Excludes local database files (`portfolio.db`), contact logs (`contact_messages.json`), cached chunks hashes (`files_hash.json`), Node modules, Python `.venv`, compiled bytecode, and all local environment variable files.
3. **Admin Verification**: The statistics dashboard endpoints are protected by an `HMAC` passcode verification header (`X-Admin-Passcode`).
4. **CORS Configuration**: Restricts API calls to explicitly allowed domains via `CORSMiddleware`.
5. **Security Headers**: Middleware automatically injects protection headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).

---

## 🚀 Deployment

Refer to the detailed [DEPLOYMENT.md](file:///c:/Users/dheer/antigravity/Adarsh-Singh-Portfolio/DEPLOYMENT.md) in the project root for full instructions on deploying:
- **React Frontend** to Firebase Hosting.
- **FastAPI Backend** to Google Cloud Run.
- **SQLite Database** using a zero-cost GCS Bucket FUSE volume mount.