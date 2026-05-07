# Streak Forge Configuration

## Environment Variables

### Required
- `GITHUB_TOKEN`: Personal Access Token for GitHub API (optional but recommended for higher rate limits)

### Optional
- `GITHUB_API_URL`: GitHub API endpoint (default: https://api.github.com)
- `CACHE_TTL`: Cache time-to-live in seconds (default: 3600)

## wrangler.toml Configuration

Key settings for Cloudflare deployment:

```toml
name = "streak-forge"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Enable Pages Functions
[site]
bucket = "./dist"

# KV Bindings (optional)
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-id"
```

## Cloudflare Pages Features

### Deployed At
- Domain: `streak-forge.pages.dev`
- Custom domain: Setup in Cloudflare dashboard

### Environment Variables (via Dashboard)
1. Go to Pages project settings
2. Add env variables for production
3. Set `GITHUB_TOKEN` as secret

### KV Namespace Setup
```bash
# Create namespace
wrangler kv:namespace create CACHE

# Add to wrangler.toml with returned IDs
```

## Astro Configuration

Key options in `astro.config.mjs`:

- `output: 'hybrid'` - Mix of static and dynamic content
- `@astrojs/react` - React component integration
- `@astrojs/cloudflare` - Cloudflare adapter (for production)

## TypeScript Setup

`tsconfig.json` includes:
- Path aliases: `@lib/*`, `@components/*`
- Full React/TypeScript support
- Cloudflare Worker types

## Development Tips

1. **Hot Reload**: Dev server automatically reloads on changes
2. **TypeScript**: Full type checking with `npm run type-check`
3. **Debugging**: Check browser console and terminal output
4. **API Testing**: Use curl or Postman for endpoint testing

## Production Build

```bash
npm run build
```

Outputs optimized files to `dist/`:
- `index.html` - Static home page
- `_worker.js` - Cloudflare Worker code
- Assets and functions bundled

Then deploy with `npm run deploy` or `wrangler deploy`.
