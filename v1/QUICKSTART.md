# Streak Forge - Quick Start

## What is Streak Forge?

A GitHub contribution streak tracker and badge generator built with **Astro + React + TypeScript** and deployed on **Cloudflare Pages**.

Inspired by [GitHub README Streak Stats](https://github.com/DenverCoder1/github-readme-streak-stats) but rewritten entirely in JavaScript/TypeScript for optimal performance on serverless platforms.

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup GitHub Token (Optional but Highly Recommended)

**Why**: Increase API rate limit from 60 to 5000 requests/hour

```bash
# Copy example env file
cp .env.example .env.local

# Edit and add your GitHub token
nano .env.local
```

**To get a GitHub token**:
1. Visit: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `read:user` - Read user profile
   - ✅ `public_repo` - Read public repositories
4. Click "Generate token"
5. Copy token and paste into `.env.local`

**Important**: Never commit `.env.local` to git!

### 3. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser! 🎉

## 📦 What's Included

- ✅ Interactive demo page (`/`)
- ✅ GitHub API integration
- ✅ Streak calculation logic
- ✅ SVG badge generation
- ✅ REST API endpoints
- ✅ TypeScript support
- ✅ Responsive UI with React

## 🔌 API Endpoints

### Get User Statistics
```bash
GET /api/user/[username]

# Example:
curl http://localhost:3000/api/user/torvalds

# Response:
{
  "username": "torvalds",
  "currentStreak": 45,
  "longestStreak": 120,
  "totalContributions": 1000,
  "lastFetch": "2024-05-07T10:30:00Z"
}
```

### Get Badge SVG
```bash
GET /api/badge/[username]

# Example:
curl http://localhost:3000/api/badge/torvalds > badge.svg

# Returns: SVG image badge
```

## 🎨 Using the Badge in Markdown

Add to your GitHub README:

```markdown
[![Streak Stats](https://streak-forge.pages.dev/api/badge/YOUR_USERNAME)](https://streak-forge.pages.dev?user=YOUR_USERNAME)
```

## 📚 Project Structure

```
streak-forge/
├── src/
│   ├── pages/
│   │   └── index.astro              # Home page with demo
│   ├── components/
│   │   ├── StreakDemo.tsx           # Main interactive component
│   │   ├── StreakInput.tsx          # Input form
│   │   └── StatsBadge.tsx           # Badge display
│   ├── functions/
│   │   └── api/
│   │       ├── user/[username].ts   # Get stats endpoint
│   │       └── badge/[username].ts  # Badge SVG endpoint
│   └── lib/
│       ├── github.ts                # GitHub API client
│       ├── calculator.ts            # Streak calculation
│       └── cache.ts                 # Caching utilities
├── package.json                     # Dependencies
├── wrangler.toml                    # Cloudflare config
├── astro.config.mjs                 # Astro config
└── tsconfig.json                    # TypeScript config
```

## 🛠️ Available Commands

```bash
# Development
pnpm dev              # Start dev server

# Production
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm deploy           # Deploy to Cloudflare

# Utilities
pnpm type-check       # Check TypeScript types
```

## 🌐 Deployment to Cloudflare

1. **Build the project**
   ```bash
   pnpm build
   ```

2. **Install Wrangler**
   ```bash
   pnpm add -g wrangler
   ```

3. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

4. **Deploy**
   ```bash
   pnpm deploy
   ```

Your site will be live at: `https://streak-forge.pages.dev`

## 📖 Documentation

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Full development guide
- [CONFIG.md](./CONFIG.md) - Configuration details
- [README.md](./README.md) - Project overview

## ⚡ Features

- 🔥 Real-time GitHub contribution tracking
- 📊 Beautiful SVG badge generation
- ⚙️ Serverless API with Cloudflare Pages Functions
- 💾 Optional KV caching for performance
- 🎯 TypeScript for type safety
- 🚀 Optimized for Cloudflare edge network

## 🔒 Privacy & Security

- No data storage by default
- GitHub API calls only (read-only)
- Optional KV caching (encrypted)
- GitHub token stored in Cloudflare secrets

## 📝 License

MIT - Feel free to use and modify!

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the project
2. Create a feature branch
3. Submit a pull request

## ❓ Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### GitHub API rate limits
Add a GitHub token to increase limits from 60 to 5000 requests/hour.

### Wrangler issues
```bash
npm update wrangler
wrangler login
```

## 🚀 Next Steps

1. ✅ Get the app running locally
2. 📝 Customize the UI in `src/components/`
3. 🚀 Deploy to Cloudflare Pages
4. 🎨 Add more badge themes
5. 📊 Implement historical data tracking

Happy coding! 🔥
