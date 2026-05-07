/**
 * Streak calculation logic
 * Calculates current streak, longest streak, and total contributions
 */

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  startDate: string;
  endDate: string;
}

/**
 * Parse contribution data and calculate streaks
 * This is a placeholder - in production, you'd parse actual GitHub data
 */
export function calculateStreaks(contributionData: Record<string, number>): StreakStats {
  const dates = Object.keys(contributionData)
    .sort()
    .map(date => new Date(date));

  if (dates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalContributions: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let totalContributions = Object.values(contributionData).reduce((a, b) => a + b, 0);

  let previousDate = new Date(dates[0]);
  previousDate.setDate(previousDate.getDate() - 1);

  for (const date of dates) {
    const diffTime = date.getTime() - previousDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1 && contributionData[date.toISOString().split('T')[0]] > 0) {
      tempStreak++;
      currentStreak = tempStreak;
    } else if (contributionData[date.toISOString().split('T')[0]] > 0) {
      tempStreak = 1;
      currentStreak = 1;
    } else {
      tempStreak = 0;
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    previousDate = date;
  }

  return {
    currentStreak,
    longestStreak,
    totalContributions,
    startDate: dates[0].toISOString().split('T')[0],
    endDate: dates[dates.length - 1].toISOString().split('T')[0],
  };
}

/**
 * Format streak stats for display
 */
export function formatStats(stats: StreakStats): string {
  return `
Current Streak: ${stats.currentStreak}
Longest Streak: ${stats.longestStreak}
Total Contributions: ${stats.totalContributions}
Period: ${stats.startDate} to ${stats.endDate}
  `.trim();
}
