# ListingCraft — MLS Listing Generator

Turn property photos + details into polished MLS listing descriptions in seconds.

## Setup

### 1. Install dependencies
```bash
cd listing-generator
npm install
```

### 2. Add your Anthropic API key
```bash
cp .env.local.example .env.local
# Edit .env.local and add your key:
# ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at: https://console.anthropic.com

### 3. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

### 4. Deploy to Vercel
```bash
npx vercel --prod
# Add ANTHROPIC_API_KEY in Vercel dashboard → Settings → Environment Variables
```

## Features
- Upload up to 12 property photos (Claude reads them)
- Fill in structured property details
- Choose tone: Professional / Warm & Inviting / Luxury
- Live 2,000 character counter (Northstar MLS limit)
- One-click copy to clipboard
- Regenerate button

## Stack
- Next.js 15 (App Router)
- Tailwind CSS
- Anthropic Claude API (vision + text)
- Vercel (hosting)
