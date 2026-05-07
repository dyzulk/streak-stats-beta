/**
 * GET /api/user/[username]
 * Returns streak statistics for a GitHub user
 */

import GitHubClient from '@lib/github';
import { calculateStreaks } from '@lib/calculator';
import { getCached, setCached, generateCacheKey } from '@lib/cache';

export const onRequest: PagesFunction = async (context) => {
  const { request, params } = context;
  const username = params.username as string;

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Validate username
    if (!username || typeof username !== 'string' || username.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid username' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Try to get cached data
    const cacheKey = generateCacheKey(username);
    const cachedData = await getCached(cacheKey, context.env.CACHE as KVNamespace);

    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Fetch from GitHub
    const githubToken = (context.env.GITHUB_TOKEN as string) || undefined;
    const client = new GitHubClient(githubToken);

    const contributionData = await client.getUserContributions(username);
    const streakStats = calculateStreaks({});

    const response = {
      username,
      currentStreak: streakStats.currentStreak,
      longestStreak: streakStats.longestStreak,
      totalContributions: streakStats.totalContributions,
      lastFetch: new Date().toISOString(),
    };

    // Cache the response
    try {
      await setCached(cacheKey, response, {
        ttl: 3600,
        namespace: context.env.CACHE as KVNamespace,
      });
    } catch {
      // Ignore cache errors
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch user data',
        message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
