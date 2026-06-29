# Progress Tracker: Step 3 Luxury Portfolio & Backend Ingestion

Tracking the status of the multi-page portfolio transition, Projects page, and Skills page.

## Phase Status
- **Navigation Architecture Change**: Completed
- **Step 2 Started**: Completed
- **Projects Page**: Completed
- **FastAPI Backend Integration**: Completed
- **CV Ingestion Script**: Completed
- **Step 3 (Skills Prestige Wall)**: Completed

## Done
- [x] Create project documentation: `PROJECT_BLUEPRINT.md` and `PROGRESS_TRACKER.md`
- [x] Install `react-router-dom`
- [x] Setup client-side routing and Framer Motion transitions in `src/App.tsx`
- [x] Rebuild persistent floating glass `Navbar V3` with `layoutId` active pill indicators
- [x] Implement Home page with preview cards (`src/pages/Home.tsx`)
- [x] Implement bento-style Projects showcase page with stack categories filter (`src/pages/Projects.tsx`)
- [x] Implement premium minimal route placeholders (`src/pages/PlaceholderPages.tsx`)
- [x] Create FastAPI backend project under `backend/`
- [x] Implement Gemini CV parser script and save structured data (`profile.json`)
- [x] Connect frontend API service dynamically to backend and remove all frontend hardcoded mock data
- [x] Dynamic roles list endpoint and UI integration (adds custom role switches dynamically)
- [x] Build dynamic `/skills` prestige wall page (`src/pages/Skills.tsx`)
- [x] Add dynamic mapping of skills into 5 domains, bento grid layout reordering based on active role priority, verified certification wall, and engineering philosophy section
- [x] Build and lint validations verified on both React and Python backend

## In Progress
- [x] Step 4: Implement Career Timeline Journey page (Completed)
- [x] Step 5: Secure Production Deployment (Completed)
  - Separate Frontend & Backend folders
  - SQLite Database persistence on GCP Cloud Storage (GCS)
  - Google Artifact Registry, Cloud Run, and Firebase Hosting setup
  - Rate limiting, timing attack protections, XSS escaping, secure headers
  - Gemini automatic model fallback configuration

---

## Future Feature Roadmap (Next Phases)
The following tasks are planned for future sessions to continue enhancing the portfolio:

### 1. Chatbot UI & Answering Formats
- **UI Enhancements**: Add smoother chat bubble animations, typing indicators, and a floating minimized chat widget.
- **Answering Format**: Fine-tune the AI Twin system prompt for highly concise, bulleted responses with embedded routing links (e.g., matching projects and skills).
- **RAG Relevance Tuning**: Adjust chunk sizes, overlap settings, and retrieval prompt context to maximize matching accuracy for technical skills.

### 2. Projects & Demos
- **Demos & Repositories**: Populate and connect the `demoUrl` and `githubUrl` fields for all projects in `profile.json`.
- **Backend Sync**: Document and automate how to push new local project details to the backend database via GCS updates.

### 3. Contact Form & Email Automation
- **API Connection**: Integrate the frontend contact page form fully with the FastAPI backend endpoint `/api/v1/portfolio/contact`.
- **SMTP Email Dispatch**: Configure the backend environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`) to enable automated email outreach delivery.

### 4. Blogs & Articles
- **Blog Database**: Create a database table and backend API for blog posts.
- **Enhanced Blog Page**: Rebuild the blog page to support markdown parsing, reading time estimates, categories, and code snippet highlighting.

### 5. Resume Download Button
- **Resume Integration**: Host the PDF resume securely (either in the GCS bucket or static frontend assets) and link it directly to the navbar "Resume" button.

### 6. GitHub Repository Sync
- **CI/CD Pipeline**: Add GitHub Actions workflow files to automate Firebase Hosting and Cloud Run container rebuilds upon pushing code to GitHub.

