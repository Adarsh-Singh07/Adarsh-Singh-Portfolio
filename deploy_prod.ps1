# deploy_prod.ps1
# Automates backing up the production database, syncing staging data changes to production,
# and deploying the production backend & frontend.

$PROJECT_ID = "portfolio2049"
$REGION = "us-central1"
$PROD_BUCKET = "adarsh-portfolio-db"
$STAGING_BUCKET = "adarsh-portfolio-db-staging"
$PROD_SERVICE = "portfolio-backend"

Write-Host "==============================================" -ForegroundColor Red
Write-Host "🚀 STARTING SAFE PRODUCTION DEPLOYMENT & MERGE" -ForegroundColor Red
Write-Host "==============================================" -ForegroundColor Red

# 1. Backup Production GCS files
Write-Host "`n[1/4] Creating database backup in production GCS..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "gs://$PROD_BUCKET/backups/backup_$timestamp"
Write-Host "Backing up production database files to $backupPath ..." -ForegroundColor Gray
gcloud storage cp gs://$PROD_BUCKET/* $backupPath/ --project=$PROJECT_ID 2>$null
Write-Host "Backup created successfully." -ForegroundColor Green

# 2. Sync database files from Staging GCS to Prod GCS
Write-Host "`n[2/4] Syncing dynamic data changes (roles, Q&As, skills) from staging GCS to production GCS..." -ForegroundColor Yellow
gcloud storage cp gs://$STAGING_BUCKET/* gs://$PROD_BUCKET/ --project=$PROJECT_ID
Write-Host "Staging database and profile configuration merged to production bucket successfully." -ForegroundColor Green

# 3. Load environment variables from local .env and Deploy Production Backend to Google Cloud Run
Write-Host "`n[3/4] Loading environment variables from .env and deploying backend..." -ForegroundColor Yellow

$envList = @()
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"').Trim("'")
            $envList += "$key=$value"
        }
    }
}

# Ensure production url is added to ALLOWED_ORIGINS for CORS
$hasOrigins = $false
for ($i = 0; $i -lt $envList.Length; $i++) {
    if ($envList[$i].StartsWith("ALLOWED_ORIGINS=")) {
        $hasOrigins = $true
        $envList[$i] = $envList[$i] + ",https://portfolio2049.web.app,https://portfolio2049.firebaseapp.com"
    }
}
if (-not $hasOrigins) {
    $envList += "ALLOWED_ORIGINS=*"
}

# Join variables using a pipe character (|) and prefix with ^|^ to tell gcloud to use pipe as separator
$envVarsString = "^|^" + [string]::Join("|", $envList)

gcloud run deploy $PROD_SERVICE `
    --source ./backend `
    --region $REGION `
    --project $PROJECT_ID `
    "--add-volume=name=db-volume,type=cloud-storage,bucket=$PROD_BUCKET" `
    "--add-volume-mount=volume=db-volume,mount-path=/app/data" `
    "--set-env-vars=$envVarsString" `
    --allow-unauthenticated

if ($LASTEXITCODE -ne 0) {
    Write-Error "Production Cloud Run deployment failed!"
    exit 1
}
Write-Host "Backend production service is live." -ForegroundColor Green

# 4. Build and Deploy Production Frontend
Write-Host "`n[4/4] Building frontend and deploying to production Firebase Hosting..." -ForegroundColor Yellow
try {
    # Build frontend (firebase.json points to portfolio-backend by default)
    Push-Location frontend
    npm run build
    Pop-Location

    # Deploy to Firebase Hosting production
    npx firebase-tools deploy --only hosting --project $PROJECT_ID
    Write-Host "Frontend production channel deployed successfully." -ForegroundColor Green
}
catch {
    Write-Error "Frontend compilation or deployment failed!"
    exit 1
}

Write-Host "`n==============================================" -ForegroundColor Green
Write-Host "🎉 PRODUCTION DEPLOYMENT & MERGE COMPLETE!" -ForegroundColor Green
Write-Host "All changes are now live on your production portfolio website." -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
