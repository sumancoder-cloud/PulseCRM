# PulseCRM — Fix OneDrive/Prisma issues and start all services
# Right-click → Run with PowerShell  OR  .\fix-and-start.ps1

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

Write-Host "`n=== PulseCRM Fix & Start ===" -ForegroundColor Cyan

# Step 1: Remind to close old terminals (they lock Prisma on OneDrive)
Write-Host "`n[1/5] Close any other terminals running npm/node for this project!" -ForegroundColor Yellow
Write-Host "      (OneDrive + running node = EPERM error)" -ForegroundColor DarkYellow
Start-Sleep -Seconds 2

# Step 2: Setup backend database (MongoDB seed)
Write-Host "[2/4] Seeding MongoDB database (Arora Roast Shoppers)..." -ForegroundColor Yellow
Set-Location "$root\crm-backend"

$setupOk = $false
try {
    node seed.js
    if ($LASTEXITCODE -eq 0) { $setupOk = $true }
} catch {
    Write-Host "Database seed failed!" -ForegroundColor Red
}

if (-not $setupOk) {
    Write-Host "`n❌ Seeding failed. Please check that MongoDB is running locally (mongodb://127.0.0.1:27017) or verify your crm-backend/.env MONGODB_URI connection string.`n" -ForegroundColor Red
    exit 1
}

# Step 3: Install channel + frontend if needed
Write-Host "[3/4] Checking other services..." -ForegroundColor Yellow
Set-Location "$root\channel-simulator"
if (-not (Test-Path "node_modules")) { npm install --silent }

Set-Location "$root\crm-frontend"
if (-not (Test-Path "node_modules\socket.io-client")) { npm install --silent }

# Step 4: Start all 3 services
Write-Host "[4/4] Starting services in new windows..." -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\channel-simulator'; Write-Host 'Channel Simulator - port 5001' -ForegroundColor Green; npm start"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\crm-backend'; Write-Host 'CRM Backend - port 5000' -ForegroundColor Green; npm run dev"
Start-Sleep -Seconds 3

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\crm-frontend'; Write-Host 'Frontend - port 5173' -ForegroundColor Green; npm run dev"

Write-Host "`n✅ PulseCRM started!" -ForegroundColor Green
Write-Host "   Open browser: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend health: http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "   Channel health: http://localhost:5001/health`n" -ForegroundColor Cyan

Set-Location $root
