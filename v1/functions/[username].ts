import { getContributionGraphs, TokenPool } from "@lib/github";
import { getContributionDates, getContributionStats, getWeeklyContributionStats, normalizeDays } from "@lib/calculator";
import { generateCard, CardParams } from "@lib/card";

interface Env {
  GITHUB_TOKEN: string;
  GITHUB_TOKEN2?: string;
  GITHUB_TOKEN3?: string;
  STREAK_STATS?: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const username = params.username as string;
  const url = new URL(request.url);
  
  // Skip if it looks like a file (e.g. favicon.ico, robots.txt)
  if (username.includes(".") || username === "favicon" || username === "robots") {
    return context.next();
  }

  // Extract query parameters for CardParams
  const queryParams: CardParams = {};
  url.searchParams.forEach((value, key) => {
    (queryParams as any)[key] = value;
  });

  try {
    const tokenPool = new TokenPool(env as any);
    
    // Check cache first
    const cacheKey = `stats-${username}-${JSON.stringify(queryParams)}`;
    if (env.STREAK_STATS) {
      const cached = await env.STREAK_STATS.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
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
    if (env.STREAK_STATS) {
      await env.STREAK_STATS.put(cacheKey, svg, { expirationTtl: 3600 });
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
