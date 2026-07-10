# deploy_staging.ps1
# Automates setting up a separate staging database and deploying a staging backend & frontend.

$PROJECT_ID = "portfolio2049"
$REGION = "us-central1"
$PROD_BUCKET = "adarsh-portfolio-db"
$STAGING_BUCKET = "adarsh-portfolio-db-staging"
$STAGING_SERVICE = "portfolio-backend-staging"
$PREVIEW_CHANNEL = "admin-crud-test"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "🚀 STARTING SAFE STAGING DEPLOYMENT PROCESS" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 1. Create Staging Bucket if it doesn't exist
Write-Host "`n[1/5] Checking GCS Staging Bucket..." -ForegroundColor Yellow
$bucketCheck = gcloud storage buckets describe gs://$STAGING_BUCKET 2>$null
if ($null -eq $bucketCheck) {
    Write-Host "Bucket gs://$STAGING_BUCKET does not exist. Creating..." -ForegroundColor Gray
    gcloud storage buckets create gs://$STAGING_BUCKET --project=$PROJECT_ID --location=$REGION
    Write-Host "Bucket created successfully." -ForegroundColor Green
} else {
    Write-Host "Staging bucket already exists." -ForegroundColor Green
}

# 2. Sync database files from Prod GCS to Staging GCS (only copy if staging is empty to avoid overwriting newer staging test data)
Write-Host "`n[2/5] Syncing database files to staging GCS..." -ForegroundColor Yellow
$stagingFiles = gcloud storage ls gs://$STAGING_BUCKET 2>$null
if ($null -eq $stagingFiles -or $stagingFiles.Length -eq 0) {
    Write-Host "Staging bucket is empty. Syncing production database files to staging..." -ForegroundColor Gray
    gcloud storage cp gs://$PROD_BUCKET/* gs://$STAGING_BUCKET/ --project=$PROJECT_ID
    Write-Host "Sync complete." -ForegroundColor Green
} else {
    Write-Host "Staging bucket already has files. Skipping production sync to preserve staging test data." -ForegroundColor Green
}

# 3. Load environment variables from local .env and Deploy Staging Backend to Google Cloud Run
Write-Host "`n[3/5] Loading environment variables from .env and deploying backend..." -ForegroundColor Yellow

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

# Ensure staging preview url is added to ALLOWED_ORIGINS for CORS
$hasOrigins = $false
for ($i = 0; $i -lt $envList.Length; $i++) {
    if ($envList[$i].StartsWith("ALLOWED_ORIGINS=")) {
        $hasOrigins = $true
        $envList[$i] = $envList[$i] + ",https://adarshsingh-portfolio--admin-crud-test-ud4lt1en.web.app"
    }
}
if (-not $hasOrigins) {
    $envList += "ALLOWED_ORIGINS=*"
}

# Join variables using a pipe character (|) and prefix with ^|^ to tell gcloud to use pipe as separator
$envVarsString = "^|^" + [string]::Join("|", $envList)

gcloud run deploy $STAGING_SERVICE `
    --source ./backend `
    --region $REGION `
    --project $PROJECT_ID `
    "--add-volume=name=db-volume,type=cloud-storage,bucket=$STAGING_BUCKET" `
    "--add-volume-mount=volume=db-volume,mount-path=/app/data" `
    "--set-env-vars=$envVarsString" `
    --allow-unauthenticated

if ($LASTEXITCODE -ne 0) {
    Write-Error "Cloud Run deployment failed!"
    exit 1
}
Write-Host "Backend staging service is live." -ForegroundColor Green

# 4. Modify firebase.json to point API calls to the staging backend service
Write-Host "`n[4/5] Temporarily updating firebase.json to point rewrites to staging backend..." -ForegroundColor Yellow
$firebaseJsonPath = "firebase.json"
$config = Get-Content $firebaseJsonPath -Raw | ConvertFrom-Json
$config.hosting.rewrites[0].run.serviceId = $STAGING_SERVICE
$configJson = ConvertTo-Json -InputObject $config -Depth 10
Set-Content -Path $firebaseJsonPath -Value $configJson
Write-Host "firebase.json updated successfully." -ForegroundColor Green

# 5. Deploy Frontend Staging Preview Channel
Write-Host "`n[5/5] Building frontend and deploying to Firebase Hosting preview channel..." -ForegroundColor Yellow
try {
    # Build frontend
    Push-Location frontend
    npm run build
    Pop-Location

    # Deploy to Firebase Hosting Preview Channel
    npx firebase-tools hosting:channel:deploy $PREVIEW_CHANNEL --project $PROJECT_ID
    Write-Host "Frontend preview channel deployed successfully." -ForegroundColor Green
}
finally {
    # Revert firebase.json back to production service ID
    Write-Host "`n[Clean-up] Reverting firebase.json back to production service ID..." -ForegroundColor Yellow
    $config = Get-Content $firebaseJsonPath -Raw | ConvertFrom-Json
    $config.hosting.rewrites[0].run.serviceId = "portfolio-backend"
    $configJson = ConvertTo-Json -InputObject $config -Depth 10
    Set-Content -Path $firebaseJsonPath -Value $configJson
    Write-Host "firebase.json restored to production configuration." -ForegroundColor Green
}

Write-Host "`n==============================================" -ForegroundColor Green
Write-Host "🎉 STAGING ENVIRONMENT IS FULLY DEPLOYED & SYNCED!" -ForegroundColor Green
Write-Host "You can now test the admin CRUD actions and uploads safely in the staging preview URL." -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
