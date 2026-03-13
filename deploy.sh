#!/bin/bash
set -e

echo "🪓 ListingCraft Deploy Script"
echo "=============================="

# Step 1: Git setup
echo ""
echo "📁 Setting up git..."
git init
git add .
git commit -m "Initial commit — ListingCraft MVP" 2>/dev/null || echo "Already committed."

# Step 2: Create GitHub repo and push
echo ""
echo "🐙 Creating GitHub repo and pushing..."
gh repo create listing-generator --public --source=. --push --description "AI-powered MLS listing generator for real estate agents"

# Step 3: Install Vercel CLI if needed
if ! command -v vercel &> /dev/null; then
  echo ""
  echo "📦 Installing Vercel CLI..."
  npm install -g vercel
fi

# Step 4: Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
echo "Follow the prompts — accept all defaults, just hit Enter."
echo ""
vercel --prod

echo ""
echo "✅ Done! Don't forget to add ANTHROPIC_API_KEY in Vercel dashboard:"
echo "   vercel.com → your project → Settings → Environment Variables"
echo "   Then redeploy from the Deployments tab."
