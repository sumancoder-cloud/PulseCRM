#!/usr/bin/env pwsh
# PulseCRM Pre-Deployment Verification Script
# Run this before deploying to ensure everything is configured correctly

Write-Host "`n🚀 PulseCRM Pre-Deployment Checklist`n" -ForegroundColor Cyan

# Check backend
Write-Host "📦 Backend Configuration" -ForegroundColor Magenta
$backendDir = "crm-backend"
$backendEnvFile = Join-Path $backendDir ".env"

if (Test-Path $backendEnvFile) {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    $envContent = Get-Content $backendEnvFile -Raw
    
    if ($envContent -match "MONGODB_URI") { Write-Host "✓ MONGODB_URI configured" -ForegroundColor Green }
    else { Write-Host "✗ MONGODB_URI missing - required for database" -ForegroundColor Red }
    
    if ($envContent -match "GEMINI_API_KEY.*[^=]") { Write-Host "✓ GEMINI_API_KEY configured" -ForegroundColor Green }
    else { Write-Host "⚠ GEMINI_API_KEY not set - AI features will use mock mode" -ForegroundColor Yellow }
    
    if ($envContent -match "FRONTEND_URL") { Write-Host "✓ FRONTEND_URL configured" -ForegroundColor Green }
    else { Write-Host "⚠ FRONTEND_URL missing - CORS may fail" -ForegroundColor Yellow }
}
else {
    Write-Host "✗ Backend .env file not found at $backendDir/.env" -ForegroundColor Red
    Write-Host "  Run: cp $backendDir/.env.example $backendDir/.env" -ForegroundColor Yellow
}

# Check frontend
Write-Host "`n🎨 Frontend Configuration" -ForegroundColor Magenta
$frontendDir = "crm-frontend"
$frontendEnvFile = Join-Path $frontendDir ".env"

if (Test-Path $frontendEnvFile) {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    $envContent = Get-Content $frontendEnvFile -Raw
    
    if ($envContent -match "VITE_API_URL") { Write-Host "✓ VITE_API_URL configured" -ForegroundColor Green }
    else { Write-Host "✗ VITE_API_URL missing - API calls will fail" -ForegroundColor Red }
}
else {
    Write-Host "⚠ Frontend .env file not found - using defaults (local dev only)" -ForegroundColor Yellow
    Write-Host "  Run: cp $frontendDir/.env.example $frontendDir/.env" -ForegroundColor Yellow
}

# Check package.json files
Write-Host "`n📋 Dependencies" -ForegroundColor Magenta
$backendPkg = Join-Path $backendDir "package.json"
$frontendPkg = Join-Path $frontendDir "package.json"

if (Test-Path $backendPkg) {
    Write-Host "✓ Backend package.json found" -ForegroundColor Green
    if (Test-Path (Join-Path $backendDir "node_modules")) {
        Write-Host "  ✓ node_modules installed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ node_modules not installed - run: npm install" -ForegroundColor Yellow
    }
}

if (Test-Path $frontendPkg) {
    Write-Host "✓ Frontend package.json found" -ForegroundColor Green
    if (Test-Path (Join-Path $frontendDir "node_modules")) {
        Write-Host "  ✓ node_modules installed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ node_modules not installed - run: npm install" -ForegroundColor Yellow
    }
}

# Check for render.yaml
Write-Host "`n🎯 Deployment Files" -ForegroundColor Magenta
if (Test-Path "DEPLOYMENT_GUIDE.md") {
    Write-Host "✓ DEPLOYMENT_GUIDE.md found" -ForegroundColor Green
}
if (Test-Path (Join-Path $backendDir "render.yaml")) {
    Write-Host "✓ Backend render.yaml found" -ForegroundColor Green
}
if (Test-Path (Join-Path $frontendDir "package.json")) {
    Write-Host "✓ Frontend ready for Vercel" -ForegroundColor Green
}

# Check Git
Write-Host "`n🔗 Version Control" -ForegroundColor Magenta
if (Test-Path ".git") {
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
    $uncommitted = & git status --short 2>$null
    if ($uncommitted) {
        Write-Host "⚠ Uncommitted changes detected:" -ForegroundColor Yellow
        Write-Host $uncommitted -ForegroundColor Gray
    } else {
        Write-Host "✓ All changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "✗ Not a git repository - required for GitHub/Render deployment" -ForegroundColor Red
}

Write-Host "`n✅ Verification Complete!`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Review the DEPLOYMENT_GUIDE.md for detailed instructions"
Write-Host "2. Set up MongoDB Atlas (or local MongoDB)"
Write-Host "3. Configure environment variables"
Write-Host "4. Deploy backend to Render"
Write-Host "5. Deploy frontend to Vercel"
Write-Host "6. Record your 5-6 minute walkthrough video"
Write-Host "7. Submit via the form before deadline"
Write-Host ""
