/**
 * GitHub GraphQL API Client
 *
 * Ported from github-readme-streak-stats/src/stats.php
 * Fetches contribution data via GitHub's GraphQL API with
 * multi-year parallel fetching and token pool support.
 */

/** GraphQL response types */
export interface ContributionDay {
  contributionCount: number;
  date: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  weeks: ContributionWeek[];
}

export interface ContributionsCollection {
  contributionYears: number[];
  contributionCalendar: ContributionCalendar;
}

export interface GraphQLUser {
  createdAt: string;
  contributionsCollection: ContributionsCollection;
}

export interface GraphQLResponse {
  data?: {
    user: GraphQLUser | null;
  };
  errors?: Array<{
    type?: string;
    message: string;
  }>;
  message?: string;
}

/** Map of year → GraphQL response */
export type ContributionGraphs = Record<number, GraphQLResponse>;

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

/**
 * Build a GraphQL query for a single year's contribution graph.
 *
 * @param user - GitHub username
 * @param year - Calendar year to query
 * @returns GraphQL query string
 */
export function buildContributionGraphQuery(user: string, year: number): string {
  const start = `${year}-01-01T00:00:00Z`;
  const end = `${year}-12-31T23:59:59Z`;
  return `query {
    user(login: "${user}") {
      createdAt
      contributionsCollection(from: "${start}", to: "${end}") {
        contributionYears
        contributionCalendar {
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }`;
}

/**
 * Execute a single GraphQL request to GitHub's API.
 *
 * @param query - GraphQL query string
 * @param token - GitHub personal access token
 * @returns Parsed JSON response
 */
export async function fetchGraphQL(
  query: string,
  token: string
): Promise<GraphQLResponse> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v4.idl",
      "User-Agent": "Streak-Forge/1.0.0",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `GitHub API returned ${response.status}: ${text || response.statusText}`
    );
  }

  return response.json() as Promise<GraphQLResponse>;
}

/**
 * Token pool manager.
 * Collects tokens from environment variables (GITHUB_TOKEN, GITHUB_TOKEN2, etc.)
 * and handles rotation when a token hits rate limits.
 */
export class TokenPool {
  private tokens: string[];

  constructor(env: Record<string, unknown>) {
    this.tokens = [];

    // Collect GITHUB_TOKEN, GITHUB_TOKEN2, GITHUB_TOKEN3, ...
    const primary = env.GITHUB_TOKEN as string | undefined;
    if (primary) {
      this.tokens.push(primary);
    }

    let index = 2;
    while (env[`GITHUB_TOKEN${index}`]) {
      this.tokens.push(env[`GITHUB_TOKEN${index}`] as string);
      index++;
    }
  }

  /** Get a random token from the pool. */
  getToken(): string {
    if (this.tokens.length === 0) {
      throw new Error("No GitHub token available. Set GITHUB_TOKEN in environment.");
    }
    return this.tokens[Math.floor(Math.random() * this.tokens.length)];
  }

  /** Remove a rate-limited token from the pool. */
  removeToken(token: string): void {
    this.tokens = this.tokens.filter((t) => t !== token);
    if (this.tokens.length === 0) {
      throw new Error(
        "All GitHub tokens have been rate-limited. Please try again later."
      );
    }
  }

  /** Check if there are tokens available. */
  get hasTokens(): boolean {
    return this.tokens.length > 0;
  }
}

/**
 * Execute contribution graph requests for multiple years in parallel.
 * Includes retry logic and rate-limit handling.
 *
 * @param user - GitHub username
 * @param years - Array of years to fetch
 * @param tokenPool - Token pool instance
 * @returns Map of year → GraphQL response
 */
export async function executeContributionGraphRequests(
  user: string,
  years: number[],
  tokenPool: TokenPool
): Promise<ContributionGraphs> {
  const responses: ContributionGraphs = {};

  // Build requests for each year (parallel)
  const results = await Promise.allSettled(
    years.map(async (year) => {
      const token = tokenPool.getToken();
      const query = buildContributionGraphQuery(user, year);

      try {
        const response = await fetchGraphQL(query, token);

        // Validate response
        if (response.errors?.length) {
          const errorType = response.errors[0].type;
          const errorMessage = response.errors[0].message;

          if (errorType === "NOT_FOUND") {
            throw new NotFoundError("Could not find a user with that name.");
          }

          if (errorMessage?.includes("rate limit")) {
            tokenPool.removeToken(token);
          }

          throw new Error(errorMessage || "GitHub API error.");
        }

        if (!response.data?.user) {
          throw new NotFoundError("Could not find a user with that name.");
        }

        return { year, response };
      } catch (error) {
        // On failure, retry once with a (possibly different) token
        if (error instanceof NotFoundError) {
          throw error;
        }

        console.error(
          `First attempt for ${user}'s ${year} contributions failed: ${error}`
        );

        const retryToken = tokenPool.getToken();
        const retryResponse = await fetchGraphQL(query, retryToken);

        if (retryResponse.errors?.length) {
          const msg = retryResponse.errors[0].message;
          if (msg?.includes("rate limit")) {
            tokenPool.removeToken(retryToken);
          }
          console.error(
            `Retry for ${user}'s ${year} failed: ${msg}`
          );
          return null;
        }

        if (!retryResponse.data?.user) {
          console.error(`Retry for ${user}'s ${year} returned no user.`);
          return null;
        }

        return { year, response: retryResponse };
      }
    })
  );

  // Collect successful responses
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      responses[result.value.year] = result.value.response;
    } else if (result.status === "rejected") {
      // Re-throw NOT_FOUND errors — they are fatal
      if (result.reason instanceof NotFoundError) {
        throw result.reason;
      }
    }
  }

  return responses;
}

/**
 * Fetch all contribution graphs for a user from their account creation
 * year (or a specified starting year) to the current year.
 *
 * Port of PHP's getContributionGraphs().
 *
 * @param user - GitHub username
 * @param tokenPool - Token pool instance
 * @param startingYear - Optional override for the earliest year to fetch
 * @returns Map of year → GraphQL response
 */
export async function getContributionGraphs(
  user: string,
  tokenPool: TokenPool,
  startingYear?: number
): Promise<ContributionGraphs> {
  const currentYear = new Date().getFullYear();

  // First, fetch the current year to get user's creation date and contribution years
  const initialResponses = await executeContributionGraphRequests(
    user,
    [currentYear],
    tokenPool
  );

  const currentYearResponse = initialResponses[currentYear];
  if (!currentYearResponse?.data?.user) {
    if (currentYearResponse?.errors) {
      console.error("GitHub API Errors:", JSON.stringify(currentYearResponse.errors, null, 2));
    }
    if (currentYearResponse?.message) {
      console.error("GitHub API Message:", currentYearResponse.message);
    }
    throw new Error(
      `Failed to retrieve contributions for user "${user}". This is likely a GitHub API issue.`
    );
  }

  const userData = currentYearResponse.data.user;
  const userCreatedYear = parseInt(userData.createdAt.split("-")[0], 10);

  // Determine the minimum year (user override or account creation year)
  let minimumYear = startingYear || userCreatedYear;
  // Git was created in 2005 — don't go further back
  minimumYear = Math.max(minimumYear, 2005);

  // Build list of remaining years to fetch
  const yearsToRequest: number[] = [];
  for (let y = minimumYear; y < currentYear; y++) {
    yearsToRequest.push(y);
  }

  // Also check for backdated contributions (e.g., commits to year 1970, see #448)
  const contributionYears =
    userData.contributionsCollection.contributionYears || [];
  if (contributionYears.length > 0) {
    const firstContributionYear =
      contributionYears[contributionYears.length - 1];
    if (firstContributionYear < 2005 && !yearsToRequest.includes(firstContributionYear)) {
      yearsToRequest.unshift(firstContributionYear);
    }
  }

  // Fetch remaining years in parallel
  if (yearsToRequest.length > 0) {
    const additionalResponses = await executeContributionGraphRequests(
      user,
      yearsToRequest,
      tokenPool
    );
    Object.assign(initialResponses, additionalResponses);
  }

  return initialResponses;
}

/**
 * Custom error for user not found.
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export default {
  buildContributionGraphQuery,
  fetchGraphQL,
  getContributionGraphs,
  executeContributionGraphRequests,
  TokenPool,
  NotFoundError,
};
