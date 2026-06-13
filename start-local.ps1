# PulseCRM — Start all services locally
# Run from MiniCRM root: .\start-local.ps1

$root = $PSScriptRoot
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

Write-Host "Setting up backend database..." -ForegroundColor Cyan
Set-Location "$root\crm-backend"
npm run setup

Write-Host "`nStarting Channel Simulator (port 5001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\channel-simulator'; npm start"

Start-Sleep -Seconds 2

Write-Host "Starting CRM Backend (port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\crm-backend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend (port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\crm-frontend'; npm run dev"

Write-Host "`nPulseCRM is starting!" -ForegroundColor Yellow
Write-Host "  Frontend:  http://localhost:5173"
Write-Host "  Backend:   http://localhost:5000/api/health"
Write-Host "  Channel:   http://localhost:5001/health"
