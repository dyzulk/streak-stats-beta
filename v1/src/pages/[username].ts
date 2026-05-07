import type { APIRoute } from 'astro';
import { getContributionGraphs, TokenPool } from "@lib/github";
import { getContributionDates, getContributionStats, getWeeklyContributionStats, normalizeDays } from "@lib/calculator";
import { generateCard, type CardParams } from "@lib/card";

export const GET: APIRoute = async ({ params, request, locals }) => {
  const username = params.username;
  if (!username) {
    return new Response("Username is required", { status: 400 });
  }

  const url = new URL(request.url);
  
  // Skip if it looks like a file
  if (username.includes(".") || username === "favicon" || username === "robots") {
    return new Response(null, { status: 404 });
  }

  // Extract query parameters for CardParams
  const queryParams: CardParams = {};
  url.searchParams.forEach((value, key) => {
    (queryParams as any)[key] = value;
  });

  try {
    // Determine the environment and tokens
    let env: any = {};
    
    // 1. Try to get environment from locals.runtime (Cloudflare)
    // We use a try-catch because Astro 6 throws on some property accesses
    try {
      const runtime = (locals as any).runtime;
      if (runtime && runtime.env) {
        env = runtime.env;
      }
    } catch (e) {
      // Ignore error and fall back
    }

    // 2. Prioritize tokens from various sources
    const GITHUB_TOKEN = env.GITHUB_TOKEN || (import.meta as any).env?.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    const GITHUB_TOKEN2 = env.GITHUB_TOKEN2 || (import.meta as any).env?.GITHUB_TOKEN2 || process.env.GITHUB_TOKEN2;
    const GITHUB_TOKEN3 = env.GITHUB_TOKEN3 || (import.meta as any).env?.GITHUB_TOKEN3 || process.env.GITHUB_TOKEN3;

    if (!GITHUB_TOKEN) {
      console.error("DEBUG: GITHUB_TOKEN not found in any source");
    }

    const tokenPool = new TokenPool({
      GITHUB_TOKEN,
      GITHUB_TOKEN2,
      GITHUB_TOKEN3,
    });
    
    // Check cache first (only on Cloudflare if KV is available)
    const cacheKey = `stats-${username}-${JSON.stringify(queryParams)}`;
    const kv = env.STREAK_STATS;
    
    if (kv) {
      try {
        const cached = await kv.get(cacheKey);
        if (cached) {
          return new Response(cached, {
            headers: {
              "Content-Type": "image/svg+xml",
              "Cache-Control": "public, max-age=3600",
            },
          });
        }
      } catch (e) {
        console.warn("KV Access Error (likely local dev without wrangler):", e);
      }
    }

    // 1. Fetch data
    const graphs = await getContributionGraphs(username, tokenPool);
    const contributions = getContributionDates(graphs);

    // 2. Calculate stats
    const mode = queryParams.mode === "weekly" ? "weekly" : "daily";
    const excludedDaysRaw = (url.searchParams.get("exclude_days") || "").split(",");
    const excludedDays = normalizeDays(excludedDaysRaw);
    
    const stats = mode === "weekly" 
      ? getWeeklyContributionStats(contributions)
      : getContributionStats(contributions, excludedDays);

    // 3. Generate SVG
    const svg = generateCard(stats, queryParams);

    // 4. Cache and return
    if (kv) {
      try {
        await kv.put(cacheKey, svg, { expirationTtl: 3600 });
      } catch (e) {
        // Ignore cache write errors
      }
    }

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Error generating badge:", error);
    
    const errorMsg = error.message || "An error occurred";
    const status = error.name === "NotFoundError" ? 404 : 500;
    
    return new Response(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100">
      <rect width="399" height="99" x="0.5" y="0.5" fill="#f8d7da" stroke="#f5c6cb" rx="4.5" />
      <text x="20" y="55" font-family="Arial" font-size="14" fill="#721c24">Error: ${errorMsg}</text>
    </svg>`, {
      status,
      headers: { 
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache"
      }
    });
  }
};
