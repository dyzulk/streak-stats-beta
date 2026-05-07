# Development Guide

## Setup

1. **Clone and Install**
   ```bash
   cd streak-forge
   pnpm install
   ```

2. **Environment Variables**
   Create `.env.local`:
   ```env
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   GITHUB_API_URL=https://api.github.com
   ```

   Get a GitHub Personal Access Token (Classic):
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "Streak Forge API")
   - **Select scopes**:
     - ✅ `read:user` (read user profile)
     - ✅ `public_repo` (read public repositories)
   - Set expiration: 90-180 days
   - Generate and copy token
   - Paste in `.env.local`: `GITHUB_TOKEN=ghp_xxxxxxxxxxxx`
   - **Never commit `.env.local` to git!**

## Development

```bash
# Start dev server (localhost:3000)
pnpm dev

# Type checking
pnpm type-check
```

Visit http://localhost:3000 to see the demo interface.

### API Endpoints (Local)

- `GET http://localhost:3000/api/user/[username]` - Get stats
- `GET http://localhost:3000/api/badge/[username]` - Get badge SVG

**Test:**
```bash
curl http://localhost:3000/api/user/torvalds
curl http://localhost:3000/api/badge/torvalds > badge.svg
```

## Building

```bash
pnpm build
```

Output goes to `dist/` directory.

## Deployment to Cloudflare

### Prerequisites

1. Cloudflare account
2. Wrangler CLI installed (`pnpm add -g wrangler`)
3. Authenticated with Cloudflare (`wrangler login`)

### Deploy

```bash
# Build first
pnpm build

# Deploy to Cloudflare Pages
pnpm deploy

# Or use wrangler directly
wrangler deploy
```

### Configure KV Cache (Optional)

To enable caching with Cloudflare KV:

1. Create KV namespace:
   ```bash
   wrangler kv:namespace create "CACHE"
   wrangler kv:namespace create "CACHE" --preview
   ```

2. Update `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "CACHE"
   id = "your-namespace-id"
   preview_id = "your-preview-id"
   ```

3. Add GitHub token to secrets:
   ```bash
   wrangler secret put GITHUB_TOKEN
   wrangler secret put GITHUB_TOKEN --env production
   ```

## Project Structure

```
src/
├── pages/
│   └── index.astro              # Main page
├── components/
│   ├── StreakDemo.tsx           # Main component
│   ├── StreakInput.tsx          # Input form
│   └── StatsBadge.tsx           # Badge display
└── lib/
    ├── github.ts                # GitHub client
    ├── calculator.ts            # Streak logic
    └── cache.ts                 # Caching utils
functions/
└── api/
    ├── user/[username].ts   # User API
    └── badge/[username].ts  # Badge API
```

## Troubleshooting

### "Cannot find module" errors
```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript errors
```bash
# Check types
pnpm type-check

# Update TypeScript
pnpm update typescript
```

### Wrangler issues
```bash
# Update wrangler
pnpm update wrangler

# Clear cache
rm -rf .wrangler
```

## GitHub API Notes

- **Rate Limits**: 60 requests/hour (unauthenticated), 5000/hour (authenticated)
- **Best Practice**: Use GitHub token for higher limits
- **GraphQL vs REST**: Currently using REST API, GraphQL available for batch queries

Future improvement: Implement GraphQL for better performance with contribution data.

## Performance Tips

1. **Enable KV Cache**: Reduces GitHub API calls significantly
2. **Cache TTL**: Currently 3600s (1 hour) - adjust as needed
3. **Compression**: Cloudflare automatically compresses responses
4. **Edge Caching**: Leverage Cloudflare's global edge network

## Next Steps

- [ ] Implement GraphQL GitHub API
- [ ] Add historical data storage (D1)
- [ ] Create dashboard for stats visualization
- [ ] Add more badge themes
- [ ] Implement user preferences
- [ ] Add webhook support for real-time updates
