/**
 * GitHub API client
 * Handles all GitHub API interactions
 */

interface GitHubUser {
  login: string;
  public_repos: number;
  followers: number;
}

interface ContributionData {
  username: string;
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  lastContributionDate: string | null;
}

export class GitHubClient {
  private apiUrl: string;
  private token?: string;

  constructor(token?: string) {
    this.apiUrl = 'https://api.github.com';
    this.token = token;
  }

  private async fetchWithAuth(url: string) {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Streak-Forge/1.0.0',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUser(username: string): Promise<GitHubUser> {
    return this.fetchWithAuth(`${this.apiUrl}/users/${username}`);
  }

  async getUserContributions(username: string): Promise<ContributionData> {
    try {
      // Note: GitHub GraphQL would be better, but REST API is simpler for now
      const user = await this.getUser(username);

      // This is a simplified version - in production, you'd parse contribution data
      // from GitHub's contribution graph or use GraphQL
      return {
        username,
        currentStreak: 0,
        longestStreak: 0,
        totalContributions: 0,
        lastContributionDate: null,
      };
    } catch (error) {
      throw new Error(`Failed to fetch contributions for ${username}: ${error}`);
    }
  }
}

export default GitHubClient;
