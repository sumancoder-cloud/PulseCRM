## Quick Git Push Script for Windows PowerShell

Write-Host "🚀 Preparing to push to GitHub..." -ForegroundColor Green

# Check if git is initialized
if (!(Test-Path .git)) {
    Write-Host "📌 Initializing Git..." -ForegroundColor Yellow
    git init
}

# Create/update .gitignore
Write-Host "📝 Creating .gitignore..." -ForegroundColor Yellow
@"
node_modules/
.env
.env.local
dist/
build/
.DS_Store
*.log
.vscode/
.idea/
*.swp
.next/
out/
"@ | Out-File -FilePath .gitignore -Encoding UTF8

# Stage all files
Write-Host "📦 Staging files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Creating commit..." -ForegroundColor Yellow
git commit -m "Initial commit: AI-native Mini CRM with Gemini integration, RFM segmentation, multi-channel campaigns, and real-time analytics"

# Check if remote exists
$remoteExists = git remote | Select-String "origin"
if ($remoteExists) {
    Write-Host "✅ Remote 'origin' already set" -ForegroundColor Green
} else {
    Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
    $repoUrl = Read-Host "Please enter your GitHub repository URL (e.g., https://github.com/sumancoder-cloud/PulseCRM.git)"
    git remote add origin $repoUrl
}

# Ensure we're on main branch
Write-Host "🌿 Setting up main branch..." -ForegroundColor Yellow
git branch -M main

# Push
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host "✅ Done! Your code is now on GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy backend to Render" -ForegroundColor White
Write-Host "2. Deploy frontend to Vercel" -ForegroundColor White
Write-Host "3. Record walkthrough video" -ForegroundColor White
Write-Host "4. Submit via Xeno form" -ForegroundColor White
