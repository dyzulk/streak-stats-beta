# 🔥 Streak Forge - Getting Started

Welcome! You now have a fully-featured GitHub streak tracker built with Astro, React, and TypeScript, ready to deploy to Cloudflare.

## Project Structure Created

```
streak-forge/
├── src/
│   ├── pages/
│   │   └── index.astro                    # Home page
│   ├── components/
│   │   ├── StreakDemo.tsx                 # Main interactive component
│   │   ├── StreakInput.tsx                # Form component
│   │   └── StatsBadge.tsx                 # Badge display component
│   ├── functions/
│   │   └── api/
│   │       ├── user/[username].ts         # GET /api/user/[username]
│   │       └── badge/[username].ts        # GET /api/badge/[username]
│   ├── lib/
│   │   ├── github.ts                      # GitHub API client
│   │   ├── calculator.ts                  # Streak calculation logic
│   │   └── cache.ts                       # KV caching utilities
│   └── index.ts                           # Entry point
├── public/                                # Static assets (images, fonts, etc.)
├── Configuration Files
│   ├── package.json                       # Dependencies & scripts
│   ├── tsconfig.json                      # TypeScript config
│   ├── astro.config.mjs                   # Astro config
│   ├── wrangler.toml                      # Cloudflare config
│   └── .env.example                       # Environment variables template
└── Documentation
    ├── README.md                          # Project overview
    ├── QUICKSTART.md                      # Quick start guide (5 min setup)
    ├── DEVELOPMENT.md                     # Development guide
    ├── ARCHITECTURE.md                    # Tech decisions & architecture
    └── CONFIG.md                          # Configuration details
```

## 5-Minute Quick Start

### Step 1: Install Dependencies
```bash
cd c:\Users\rdp\Documents\dyzulk\streak-stats
pnpm install
```

### Step 2: Setup GitHub Token (Optional but Recommended)

**Why**: Increase API rate limit from 60 to 5000 requests/hour

```bash
# Copy template
copy .env.example .env.local
```

**Get GitHub token**:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select **scopes**:
   - `read:user` (read user profile)
   - `public_repo` (read public repositories)
4. Click "Generate token"
5. Copy & paste into `.env.local`: `GITHUB_TOKEN=ghp_xxxx`

**⚠️ Security**: Never commit `.env.local` - it's in `.gitignore`

### Step 3: Start Development Server
```bash
pnpm dev
```

Open **http://localhost:3000** in your browser! 🎉

## What You Can Do Now

### 1. **See It Working**
- Open http://localhost:3000
- Enter a GitHub username (e.g., "torvalds", "gvanrossum")
- See real-time streak stats and badge

### 2. **Test the API**
```bash
# Get stats as JSON
curl http://localhost:3000/api/user/torvalds

# Get badge as SVG
curl http://localhost:3000/api/badge/torvalds > badge.svg
```

### 3. **Customize**
- Edit components in `src/components/`
- Modify colors, themes, styling
- Add new features

### 4. **Deploy to Production**
```bash
pnpm build
pnpm deploy
# (Requires wrangler login first)
```

## Key Features Ready to Use

✅ **Interactive Demo Page** (`/`)
- User input form
- Real-time streak calculation
- Beautiful badge display
- Copy-to-clipboard for markdown

✅ **REST API Endpoints**
- `GET /api/user/[username]` → JSON stats
- `GET /api/badge/[username]` → SVG badge

✅ **Production Ready**
- TypeScript type safety
- Error handling
- Cloudflare edge optimization
- Optional KV caching

## Available Commands

```bash
npm run dev              # Start dev server (auto-reload)
npm run build            # Build for production
npm run preview          # Preview production build locally
npm run deploy           # Deploy to Cloudflare Pages
npm run type-check       # Check TypeScript for errors
```

## Tech Stack Breakdown

| Layer | Technology | Why? |
|-------|-----------|------|
| **Frontend** | Astro + React | Optimal for Cloudflare, minimal JS |
| **Styling** | CSS-in-JS | Scoped, component-friendly |
| **Backend** | Pages Functions | Serverless, global, auto-scaling |
| **Language** | TypeScript | Type safety, better DX |
| **Caching** | Cloudflare KV | Optional, reduces API calls |
| **Deployment** | Cloudflare Pages | Free, fast, reliable |

## File-by-File Explanation

### Frontend
- **`src/pages/index.astro`** - Main page layout (static HTML + React)
- **`src/components/StreakDemo.tsx`** - Main interactive container
- **`src/components/StreakInput.tsx`** - Form input component
- **`src/components/StatsBadge.tsx`** - Badge display + stats

### Backend
- **`src/functions/api/user/[username].ts`** - Get streak stats endpoint
- **`src/functions/api/badge/[username].ts`** - Generate SVG badge endpoint

### Utilities
- **`src/lib/github.ts`** - GitHub API client (fetch user data)
- **`src/lib/calculator.ts`** - Streak calculation logic
- **`src/lib/cache.ts`** - Cloudflare KV caching helpers

### Configuration
- **`package.json`** - pnpm dependencies & scripts
- **`tsconfig.json`** - TypeScript configuration
- **`astro.config.mjs`** - Astro framework settings
- **`wrangler.toml`** - Cloudflare Pages config
- **`.env.local`** - Environment variables (create from `.env.example`)

## Next Steps

### Short Term (Today)
1. ✅ Run `pnpm install`
2. ✅ Run `pnpm dev`
3. ✅ Test with your GitHub username
4. ✅ Customize colors/text

### Medium Term (This Week)
1. Add GitHub token for better rate limits
2. Deploy to Cloudflare (`pnpm deploy`)
3. Get custom domain (optional)
4. Share badge code with others

### Long Term (Later)
1. Add more badge themes
2. Implement historical data storage
3. Create analytics dashboard
4. Build community features

## Common Tasks

### How to Change Badge Colors?
Edit `src/components/StatsBadge.tsx` → Update the SVG colors or CSS styles

### How to Add a New Feature?
1. Create component in `src/components/`
2. Add to `src/pages/index.astro`
3. Test locally with `npm run dev`

### How to Deploy Updates?
```bash
npm run build     # Build
npm run deploy    # Deploy to Cloudflare
```

Takes ~30 seconds! No server restarts needed.

## Troubleshooting

### Port 3000 Already in Use?
```bash
npm run dev -- --port 3001
```

### TypeScript Errors?
```bash
npm run type-check    # See all errors
npm install           # Update dependencies
```

### GitHub API Errors?
- Add `GITHUB_TOKEN` to `.env.local`
- Or wait for rate limit reset (1 hour)

### Build Fails?
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Resources

📖 **Documentation**
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Full dev guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Tech decisions

🔗 **External Links**
- [Astro Docs](https://docs.astro.build)
- [Cloudflare Pages](https://pages.cloudflare.com)
- [GitHub API](https://docs.github.com/en/rest)
- [React Docs](https://react.dev)

## Need Help?

1. Check [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed guides
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for tech decisions
3. Search [Astro docs](https://docs.astro.build)
4. Check [Cloudflare docs](https://developers.cloudflare.com)

---

**You're all set!** 🚀 Run `pnpm install && pnpm dev` to get started!
