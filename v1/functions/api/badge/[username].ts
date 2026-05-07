/**
 * GET /api/badge/[username]
 * Returns an SVG badge for a GitHub user's streak stats
 */

import GitHubClient from '@lib/github';
import { calculateStreaks } from '@lib/calculator';
import { getCached, setCached, generateCacheKey } from '@lib/cache';

/**
 * Generate SVG badge for streak stats
 */
function generateBadgeSVG(
  username: string,
  currentStreak: number,
  longestStreak: number,
  totalContributions: number
): string {
  return `
    <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0969da;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1f6feb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="150" fill="url(#grad)" rx="6" />
      
      <!-- Flame icon background -->
      <rect x="20" y="30" width="90" height="90" fill="#054da4" rx="6" />
      
      <!-- Flame emoji -->
      <text x="65" y="90" font-size="45" text-anchor="middle" fill="#ffa657">🔥</text>
      
      <!-- Current Streak Label -->
      <text x="130" y="50" font-size="14" fill="#ffffff" font-weight="600">Current Streak</text>
      
      <!-- Current Streak Value -->
      <text x="130" y="78" font-size="36" fill="#79c0ff" font-weight="700">${currentStreak}</text>
      
      <!-- Divider -->
      <line x1="220" y1="30" x2="220" y2="120" stroke="#30363d" stroke-width="1" />
      
      <!-- Longest Streak -->
      <text x="240" y="50" font-size="12" fill="#8b949e">
        Longest: <tspan font-weight="700">${longestStreak}</tspan>
      </text>
      
      <!-- Total Contributions -->
      <text x="240" y="75" font-size="12" fill="#8b949e">
        Total: <tspan font-weight="700">${totalContributions.toLocaleString()}</tspan>
      </text>
      
      <!-- Username -->
      <text x="240" y="110" font-size="11" fill="#8b949e" font-style="italic">@${username}</text>
    </svg>
  `.trim();
}

export const onRequest: PagesFunction = async (context) => {
  const { request, params } = context;
  const username = params.username as string;

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  try {
    // Validate username
    if (!username || typeof username !== 'string' || username.length === 0) {
      return new Response('Invalid username', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Try to get cached data
    const cacheKey = `badge:${generateCacheKey(username)}`;
    const cachedData = await getCached<string>(cacheKey, context.env.CACHE as KVNamespace);

    if (cachedData) {
      return new Response(cachedData, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Fetch from GitHub
    const githubToken = (context.env.GITHUB_TOKEN as string) || undefined;
    const client = new GitHubClient(githubToken);

    const contributionData = await client.getUserContributions(username);
    const streakStats = calculateStreaks({});

    // Generate SVG
    const svg = generateBadgeSVG(
      username,
      streakStats.currentStreak,
      streakStats.longestStreak,
      streakStats.totalContributions
    );

    // Cache the SVG
    try {
      await setCached(cacheKey, svg, {
        ttl: 3600,
        namespace: context.env.CACHE as KVNamespace,
      });
    } catch {
      // Ignore cache errors
    }

    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Return error SVG
    const errorSvg = `
      <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="150" fill="#ffebee" rx="6" />
        <text x="200" y="75" font-size="14" text-anchor="middle" fill="#cb2431" font-weight="600">
          Error loading stats
        </text>
      </svg>
    `.trim();

    return new Response(errorSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  }
};
