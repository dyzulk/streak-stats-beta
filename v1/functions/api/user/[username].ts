import { getContributionGraphs, TokenPool } from "@lib/github";
import { getContributionDates, getContributionStats, getWeeklyContributionStats, normalizeDays } from "@lib/calculator";

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

  try {
    const tokenPool = new TokenPool(env as any);
    
    // Check cache
    const mode = url.searchParams.get("mode") === "weekly" ? "weekly" : "daily";
    const excludedDaysRaw = (url.searchParams.get("exclude_days") || "").split(",");
    const excludedDays = normalizeDays(excludedDaysRaw);
    
    const cacheKey = `json-${username}-${mode}-${excludedDays.join(",")}`;
    if (env.STREAK_STATS) {
      const cached = await env.STREAK_STATS.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    }

    // 1. Fetch data
    const graphs = await getContributionGraphs(username, tokenPool);
    const contributions = getContributionDates(graphs);

    // 2. Calculate stats
    const stats = mode === "weekly" 
      ? getWeeklyContributionStats(contributions)
      : getContributionStats(contributions, excludedDays);

    const responseData = JSON.stringify(stats);

    // 3. Cache and return
    if (env.STREAK_STATS) {
      await env.STREAK_STATS.put(cacheKey, responseData, { expirationTtl: 3600 });
    }

    return new Response(responseData, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    const status = error.name === "NotFoundError" ? 404 : 500;
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred" 
    }), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  }
};
