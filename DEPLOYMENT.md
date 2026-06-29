# Deployment Guide: Firebase Hosting + GCP Cloud Run (Free Tier Optimized)

This guide outlines how to deploy the React Frontend on **Firebase Hosting** and the FastAPI Backend on **GCP Cloud Run** within Google Cloud's **Always Free Tier** quotas, utilizing a zero-cost GCS volume mount to persist the SQLite database.

## Architecture Overview

```
                      +-----------------------------+
                      |      Firebase Hosting       |
                      |   (Static Web Assets & JS)  |
                      +--------------+--------------+
                                     |
                       (All /api/** requests routed)
                                     v
                      +-----------------------------+
                      |       GCP Cloud Run         |  <--- Mounts GCS Bucket via FUSE
                      |   (FastAPI Backend App)     |       to persist SQLite DB at /app/data
                      +-----------------------------+
```

By leveraging Firebase Hosting's `rewrites` configuration, the frontend requests `/api/v1/...` relative URLs directly. Firebase proxies these requests to Cloud Run on the server side, completely eliminating **CORS issues** and securing communications.

---

## 1. Google Cloud Run (Backend) Deployment

FastAPI runs on Cloud Run, which includes a generous **Always Free Tier** of:
- 2 million requests per month
- 180,000 vCPU-seconds per month
- 360,000 GiB-seconds of memory per month
- 180,000 egress GiB per month

### Step 1: Create a Google Cloud Storage (GCS) Bucket
To persist contact outreach logs and chat histories without paying for Cloud SQL, create a GCS bucket (always-free tier provides up to **5 GB** of storage).

1. Go to the **GCP Console** -> **Cloud Storage** -> **Buckets**.
2. Click **Create** and configure:
   - **Name**: `YOUR_PROJECT_ID-portfolio-db`
   - **Region**: Set explicitly to `us-central1` (required for Always Free quotas).
   - **Storage Class**: Standard.
   - **Access Control**: Uniform.
   - Keep default encryption settings.

### Step 2: Build & Deploy Container to Cloud Run
Run the following command from the `backend/` directory to deploy using GCP's built-in buildpacks (requires Google Cloud CLI installed):

```bash
gcloud run deploy portfolio-backend \
    --source . \
    --region us-central1 \
    --allow-unauthenticated
```

During deployment:
- Say **Yes** when prompted to enable any missing Google APIs (Artifact Registry, Cloud Build, Cloud Run).
- The Dockerfile will build a clean, lightweight image without copying local virtual envs or SQLite files.

### Step 3: Configure Environment Variables & GCS Mounts
Once deployed, configure the service settings:

1. **Environment Variables**:
   Go to the deployed Cloud Run service -> **Edit & Deploy New Revision** -> **Variables & Secrets** tab. Add:
   - `GEMINI_API_KEY`: *(Your secure API key)*
   - `ADMIN_PASSCODE`: *(A strong password for decrypting leads on the dashboard)*
   - `ALLOWED_ORIGINS`: `https://YOUR_PROJECT_ID.web.app,https://YOUR_PROJECT_ID.firebaseapp.com`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: *(Optional - for sending emails)*

2. **Mount Persistent Cloud Storage Volume**:
   Under the **Volumes** tab, click **Add Volume**:
   - **Volume Type**: Cloud Storage bucket.
   - **Volume Name**: `db-volume`
   - **Bucket Name**: `YOUR_PROJECT_ID-portfolio-db`
   
   Next, under the **Container** tab, add a **Volume Mount**:
   - **Volume**: Select `db-volume`
   - **Mount Path**: `/app/data`

3. Click **Deploy**. Cloud Run will automatically mount the bucket at `/app/data`. The SQLite database file (`portfolio.db`) and backup outreach JSON files will now persist in GCS across all container scales and restarts for **$0/month**!

---

## 2. Firebase Hosting (Frontend) Deployment

Firebase Hosting provides a generous free tier of **10 GB** storage and **360 GB** bandwidth per month.

### Step 1: Build the React Application
Inside the `frontend/` directory, compile the production bundle:

```bash
npm run build
```
This builds your React SPA and compiles static outputs in the `frontend/dist` directory.

### Step 2: Initialize Firebase CLI
If you haven't installed Firebase CLI, install it globally:
```bash
npm install -g firebase-tools
```

Authenticate and link to your Google Cloud Project:
```bash
firebase login
```

Initialize your hosting workspace at the **project root**:
```bash
firebase init hosting
```

Select the following configuration choices:
- **Associate with project**: Select your existing GCP Project.
- **What do you want to use as your public directory?** `frontend/dist`
- **Configure as a single-page app (rewrite all urls to /index.html)?** `Yes`
- **Set up automatic builds and deploys with GitHub?** `No` (or `Yes` if using CI/CD)
- **File frontend/dist/index.html already exists. Overwrite?** `No` (Keep your built file)

### Step 3: Verify firebase.json Config
Make sure your root `firebase.json` matches the configuration below, which handles SPA routing and rewrites `/api/**` calls directly to the Cloud Run backend:

```json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "portfolio-backend",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Step 4: Deploy the App
Deploy the static assets directly to Firebase Hosting:

```bash
firebase deploy --only hosting
```

Your app is now live! Visitors can access the website at `https://YOUR_PROJECT_ID.web.app` or `https://YOUR_PROJECT_ID.firebaseapp.com`.

---

## 3. Best Practices & Free Tier Safety Guardrails

- **Region Binding (`us-central1`)**: Keep all resources (Cloud Storage, Cloud Run, Firebase Hosting rewrites) bound to `us-central1` to leverage free tier allotments safely.
- **Secrets Management**: Do not put your `GEMINI_API_KEY` or `SMTP_PASSWORD` directly in any environment variables text fields in your code repository. In production, load them into **Google Cloud Secret Manager** and reference them in Cloud Run to prevent key leaks.
- **Auto-Scaling Protection**: To ensure Cloud Run stays free and doesn't scale up aggressively during sudden traffic surges, set **Max Instances = 10** (or even 3) in the Cloud Run CPU scaling settings. This limits concurrent container instances while maintaining speedy response times.
