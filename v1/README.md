# Streak Forge

GitHub contribution streak statistics and badges - powered by Cloudflare Pages Functions.

A JavaScript/Node.js reimplementation of GitHub README streak stats, optimized for Cloudflare's serverless platform.

## Features

- 📊 Track GitHub contribution streaks
- 🎨 Dynamic SVG badge generation
- ⚡ Serverless deployment on Cloudflare Pages
- 🔍 Real-time statistics calculation
- 💾 Optional caching with Cloudflare KV
- 📱 Responsive demo interface

## Tech Stack

- **Frontend**: Astro + React + TypeScript
- **Backend**: Hono + Cloudflare Pages Functions
- **Deployment**: Cloudflare Pages
- **Language**: JavaScript/TypeScript

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Deploy to Cloudflare
npm run deploy
```

## Project Structure

```
streak-forge/
├── src/
│   ├── pages/
│   │   └── index.astro              # Demo page
│   ├── components/
│   │   ├── StreakDemo.tsx           # Main demo component
│   │   ├── StreakInput.tsx          # Input form
│   │   └── StatsBadge.tsx           # Badge display
│   ├── functions/
│   │   └── api/
│   │       ├── user/[username].ts   # User stats endpoint
│   │       └── badge/[username].ts  # Badge generation endpoint
│   └── lib/
│       ├── github.ts                # GitHub API client
│       ├── calculator.ts            # Streak calculation logic
│       └── cache.ts                 # Caching utilities
├── public/                           # Static assets
├── wrangler.toml                    # Cloudflare config
├── astro.config.mjs                 # Astro config
├── tsconfig.json                    # TypeScript config
└── package.json
```

## Environment Variables

Create a `.env.local` file:

```env
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_API_URL=https://api.github.com
```

## API Endpoints

### Get User Stats
```
GET /api/user/[username]

Response:
{
  "username": "string",
  "currentStreak": number,
  "longestStreak": number,
  "totalContributions": number,
  "lastContributionDate": "ISO8601"
}
```

### Get Badge SVG
```
GET /api/badge/[username]

Returns: SVG badge image
```

## License

MIT

## Credits

Inspired by [GitHub README Streak Stats](https://github.com/DenverCoder1/github-readme-streak-stats)
