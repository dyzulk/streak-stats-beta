# Streak Forge - Architecture & Tech Stack

## Tech Stack Overview

### Frontend
- **Astro** - Static site generation with React island architecture
- **React** - Interactive components (TypeScript)
- **CSS-in-JS** - Styled components for scoped styling

### Backend
- **Cloudflare Pages Functions** - Serverless API handlers
- **Hono** - (Future integration) lightweight routing framework
- **Node.js/TypeScript** - Runtime and language

### Infrastructure
- **Cloudflare Pages** - Edge deployment
- **Cloudflare KV** - Optional distributed caching
- **Cloudflare D1** - Optional SQLite database (future)

### Development
- **Wrangler** - Cloudflare CLI & local development
- **TypeScript** - Type-safe JavaScript
- **npm** - Package management

## Architecture Decisions

### Why Astro?

1. **Optimal for Cloudflare Pages**
   - Native Pages Integration via adapter
   - Zero-JavaScript by default
   - Hybrid rendering (static + dynamic)

2. **Island Architecture**
   - Static HTML for `/` page
   - React components only where needed
   - Minimal JavaScript bundle size
   - Perfect for Pages limitations

3. **Superior Developer Experience**
   - File-based routing
   - Built-in CSS support
   - Component-friendly
   - Excellent TypeScript support

```
Astro Pages      React Components      TypeScript
    ↓                  ↓                    ↓
  Static HTML     Interactive UI        Type Safety
    ↓                  ↓                    ↓
    ├─────────────────┴────────────────────┤
    ↓
 Minimal JS Bundle
```

### Why Not Next.js / Nuxt / SvelteKit?

| Framework | Reason Not Ideal |
|-----------|------------------|
| **Next.js** | Better for full-stack Node.js apps; Cloudflare support is limited; requires more setup |
| **Nuxt** | Vue-focused; more complex for this use case |
| **SvelteKit** | Good alternative, but Astro better for static + dynamic mix |

### Cloudflare Pages Functions

Instead of traditional backend server:
- **Serverless**: No server maintenance
- **Global Edge**: Deployed to 300+ data centers
- **Auto-scaling**: Handles traffic spikes
- **Pay-per-use**: Only pay for requests
- **Native integrations**: KV, D1, R2, etc.

```
Client Request
    ↓
Cloudflare Edge
    ↓
Pages Function
    ↓
GitHub API or KV Cache
    ↓
Response
```

### Why TypeScript Everywhere?

1. **Type Safety** - Catch errors at compile time
2. **Better IDE Support** - IntelliSense and autocompletion
3. **Self-documenting** - Types serve as documentation
4. **Refactoring** - Easier to rename and restructure
5. **Team Collaboration** - Clearer contracts between modules

## Component Structure

### Frontend Components

```
StreakDemo (Main Container)
├── StreakInput (Form)
│   └── Uses: handleSubmit callback
└── StatsBadge (Display)
    ├── SVG Badge
    └── Statistics Cards
```

### Backend Functions

```
Pages Functions
├── /api/user/[username]
│   └── Returns JSON stats
│       ├── Fetches: GitHub API
│       ├── Caches: KV (optional)
│       └── Returns: { currentStreak, longestStreak, ... }
│
└── /api/badge/[username]
    └── Returns SVG badge
        ├── Fetches: GitHub API or Cache
        ├── Generates: SVG markup
        └── Returns: image/svg+xml
```

## Data Flow

### Getting Streak Stats

```
1. User enters username in UI
          ↓
2. Frontend makes GET /api/user/[username]
          ↓
3. Pages Function receives request
          ↓
4. Check KV cache (if available)
          ↓ (miss)
5. Fetch from GitHub API
          ↓
6. Calculate streaks
          ↓
7. Cache result in KV
          ↓
8. Return JSON to frontend
          ↓
9. Display stats & badge
```

### Badge Generation

```
1. GET /api/badge/[username]
          ↓
2. Check cache (KV)
          ↓ (miss)
3. Fetch stats from GitHub
          ↓
4. Generate SVG markup
          ↓
5. Cache SVG in KV
          ↓
6. Return image/svg+xml
          ↓
7. Browser renders badge
```

## Performance Optimizations

### 1. Caching Strategy
- **Frontend**: HTTP cache headers (3600s)
- **Backend**: Cloudflare KV cache
- **Edge**: Cloudflare edge cache

### 2. Code Splitting
- Static: HTML generated at build time
- Dynamic: React components loaded on-demand
- API: Separate functions per endpoint

### 3. Bundle Size
- Zero unnecessary JavaScript by default
- React only on interactive components
- CSS scoped to components

### 4. API Response Time
- KV cache avoids GitHub API calls
- Edge deployment for global latency
- SVG generation is lightweight

## Scalability

### Current Architecture
- ✅ Handles thousands of concurrent users
- ✅ No database bottlenecks
- ✅ Auto-scaling by Cloudflare
- ✅ Global edge distribution

### With KV Caching
- ✅ Reduced GitHub API calls
- ✅ Sub-100ms response times
- ✅ 3 hours rate limit per user
- ✅ Distributed cache globally

### Future Improvements
- **GraphQL API**: Batch requests to GitHub
- **D1 Database**: Historical data storage
- **Webhooks**: Real-time updates
- **Analytics**: Track popular users

## Security Considerations

### Current
- ✅ Read-only GitHub API access
- ✅ No data storage by default
- ✅ HTTPS everywhere
- ✅ Token stored in Cloudflare secrets

### Best Practices
- ✅ Validate username input
- ✅ Rate limit via Cloudflare
- ✅ CORS headers properly configured
- ✅ Error messages don't leak info

### Token Security
- Never expose in client code
- Stored in Cloudflare environment secrets
- Separate tokens per environment (dev/prod)
- Rotate regularly

## Deployment Strategy

### Development
```bash
npm run dev
# Local testing on localhost:3000
```

### Production
```bash
npm run build
npm run deploy
# Deployed to Cloudflare Pages globally
```

### Environment Management
```
.env.local (dev secrets) → .gitignore
wrangler.toml (config) → committed
Cloudflare Dashboard → prod secrets
```

## Monitoring & Debugging

### Local Development
- `npm run dev` - Hot reload
- Browser DevTools - Frontend debugging
- Terminal logs - Function logs
- Network tab - API requests

### Production
- Cloudflare Analytics - Traffic & errors
- Wrangler tail - Real-time logs
- Error tracking - Via Cloudflare Logpush
- Uptime monitoring - Cloudflare Workers Analytics

## Cost Analysis

### Free Tier (Cloudflare Pages)
- ✅ Unlimited requests
- ✅ 100,000 Functions/day
- ✅ 50ms CPU per request
- ✅ Sufficient for most use cases

### With KV (Optional)
- ~$0.50/month per namespace
- 3 million read operations included
- 0.6 million write operations included

### Total Cost
- **Free**: Development & light usage
- **$5-10/month**: Heavy usage + KV + custom domain

## Future Tech Additions

### Short Term
- [ ] GraphQL support for GitHub
- [ ] Additional badge themes
- [ ] User preferences storage
- [ ] Analytics dashboard

### Medium Term
- [ ] D1 database integration
- [ ] Webhook support
- [ ] Real-time updates via WebSockets
- [ ] GitHub Actions integration

### Long Term
- [ ] CLI tool for local generation
- [ ] API marketplace for third-party tools
- [ ] Machine learning for predictions
- [ ] Community contributions system

## References

- [Astro Documentation](https://docs.astro.build)
- [Cloudflare Pages Guide](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [GitHub API Reference](https://docs.github.com/en/rest/)
- [React Documentation](https://react.dev)
