#!/bin/bash
# Quick Git Push Script - Run this to push to GitHub

echo "🚀 Preparing to push to GitHub..."

# Navigate to project root
cd "$(dirname "$0")"

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📌 Initializing Git..."
    git init
fi

# Create/update .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
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
EOF

# Stage all files
echo "📦 Staging files..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Initial commit: AI-native Mini CRM with Gemini integration, RFM segmentation, multi-channel campaigns, and real-time analytics"

# Check if remote exists
if git remote | grep -q origin; then
    echo "✅ Remote 'origin' already set"
else
    echo "🔗 Adding remote origin..."
    echo "Please enter your GitHub repository URL (e.g., https://github.com/sumancoder-cloud/PulseCRM.git):"
    read REPO_URL
    git remote add origin "$REPO_URL"
fi

# Ensure we're on main branch
echo "🌿 Setting up main branch..."
git branch -M main

# Push
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo "✅ Done! Your code is now on GitHub!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Render"
echo "2. Deploy frontend to Vercel"
echo "3. Record walkthrough video"
echo "4. Submit via Xeno form"
