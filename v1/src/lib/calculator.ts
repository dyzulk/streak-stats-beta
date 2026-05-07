/**
 * Streak Calculation Logic
 *
 * Ported from github-readme-streak-stats/src/stats.php
 * Calculates daily/weekly streaks, total contributions,
 * and tracks start/end dates for each streak.
 */

import type { ContributionGraphs, GraphQLResponse } from "./github";

/** Valid day-of-week abbreviations */
const VALID_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
type DayAbbreviation = (typeof VALID_DAYS)[number];

/** Streak period with start/end dates and length */
export interface StreakPeriod {
  start: string;
  end: string;
  length: number;
}

/** Full streak statistics output */
export interface StreakStats {
  mode: "daily" | "weekly";
  totalContributions: number;
  firstContribution: string;
  longestStreak: StreakPeriod;
  currentStreak: StreakPeriod;
  excludedDays: string[];
}

/**
 * Extract contribution dates from GraphQL responses.
 *
 * Parses all year-keyed GraphQL responses, sorts by year,
 * and returns a flat map of `YYYY-MM-DD` → contribution count.
 * Includes tomorrow's date if the user already contributed.
 *
 * Port of PHP's getContributionDates().
 *
 * @param contributionGraphs - Map of year → GraphQL response
 * @returns Date-indexed contribution counts
 */
export function getContributionDates(
  contributionGraphs: ContributionGraphs
): Record<string, number> {
  const contributions: Record<string, number> = {};
  const now = new Date();
  const today = formatDate(now);
  const tomorrow = formatDate(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  );

  // Sort by year key
  const sortedYears = Object.keys(contributionGraphs)
    .map(Number)
    .sort((a, b) => a - b);

  for (const year of sortedYears) {
    const graph: GraphQLResponse = contributionGraphs[year];
    const weeks =
      graph?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (!weeks) continue;

    for (const week of weeks) {
      for (const day of week.contributionDays) {
        const date = day.date;
        const count = day.contributionCount;

        // Count contributions up until today.
        // Also count tomorrow if user already contributed (timezone edge case).
        if (date <= today || (date === tomorrow && count > 0)) {
          contributions[date] = count;
        }
      }
    }
  }

  return contributions;
}

/**
 * Normalize day-of-week names to 3-letter abbreviations.
 *
 * Examples: ["Sunday", " mon", "TUE"] → ["Sun", "Mon", "Tue"]
 *
 * Port of PHP's normalizeDays().
 *
 * @param days - Raw day name strings
 * @returns Normalized 3-letter abbreviations
 */
export function normalizeDays(days: string[]): string[] {
  return days
    .map((day) => {
      const trimmed = day.trim().toLowerCase();
      if (!trimmed) return null;
      const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      const abbr = capitalized.substring(0, 3);
      return VALID_DAYS.includes(abbr as DayAbbreviation) ? abbr : null;
    })
    .filter((d): d is string => d !== null);
}

/**
 * Check if a given date falls on an excluded day of the week.
 *
 * Port of PHP's isExcludedDay().
 *
 * @param date - Date string in YYYY-MM-DD format
 * @param excludedDays - Normalized day abbreviations to exclude
 * @returns True if the date's day-of-week is excluded
 */
export function isExcludedDay(date: string, excludedDays: string[]): boolean {
  if (excludedDays.length === 0) return false;
  const dayIndex = new Date(date + "T00:00:00Z").getUTCDay();
  const dayName = VALID_DAYS[dayIndex];
  return excludedDays.includes(dayName);
}

/**
 * Calculate daily contribution streak statistics.
 *
 * Port of PHP's getContributionStats().
 * Iterates through all contribution dates, tracking current and longest
 * streaks. Excluded days extend the streak without requiring contributions.
 * Today is given an exception — not contributing today doesn't reset the streak.
 *
 * @param contributions - Date-indexed contribution counts
 * @param excludedDays - Normalized day abbreviations to exclude
 * @returns Full streak statistics
 * @throws Error if no contributions found
 */
export function getContributionStats(
  contributions: Record<string, number>,
  excludedDays: string[] = []
): StreakStats {
  const dates = Object.keys(contributions);
  if (dates.length === 0) {
    throw new Error("No contributions found.");
  }

  const today = dates[dates.length - 1];
  const first = dates[0];

  const stats: StreakStats = {
    mode: "daily",
    totalContributions: 0,
    firstContribution: "",
    longestStreak: { start: first, end: first, length: 0 },
    currentStreak: { start: first, end: first, length: 0 },
    excludedDays,
  };

  for (const date of dates) {
    const count = contributions[date];

    // Add to total
    stats.totalContributions += count;

    // Check if still in streak:
    // Either has contributions, or is an excluded day during an active streak
    if (
      count > 0 ||
      (stats.currentStreak.length > 0 && isExcludedDay(date, excludedDays))
    ) {
      // Increment streak
      stats.currentStreak.length++;
      stats.currentStreak.end = date;

      // Set start on first day of streak
      if (stats.currentStreak.length === 1) {
        stats.currentStreak.start = date;
      }

      // Set first contribution date (only once)
      if (!stats.firstContribution) {
        stats.firstContribution = date;
      }

      // Update longest streak if current exceeds it
      if (stats.currentStreak.length > stats.longestStreak.length) {
        stats.longestStreak.start = stats.currentStreak.start;
        stats.longestStreak.end = stats.currentStreak.end;
        stats.longestStreak.length = stats.currentStreak.length;
      }
    }
    // Reset streak — but give exception for today
    else if (date !== today) {
      stats.currentStreak.length = 0;
      stats.currentStreak.start = today;
      stats.currentStreak.end = today;
    }
  }

  return stats;
}

/**
 * Get the previous Sunday for a given date.
 *
 * Port of PHP's getPreviousSunday().
 *
 * @param date - Date string in YYYY-MM-DD format
 * @returns Previous Sunday in YYYY-MM-DD format
 */
export function getPreviousSunday(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  const dayOfWeek = d.getUTCDay(); // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - dayOfWeek);
  return formatDate(d);
}

/**
 * Calculate weekly contribution streak statistics.
 *
 * Port of PHP's getWeeklyContributionStats().
 * Groups contributions by week (Sunday-based) and calculates
 * weekly streaks. The current week is given an exception.
 *
 * @param contributions - Date-indexed contribution counts
 * @returns Full streak statistics in weekly mode
 * @throws Error if no contributions found
 */
export function getWeeklyContributionStats(
  contributions: Record<string, number>
): StreakStats {
  const dates = Object.keys(contributions);
  if (dates.length === 0) {
    throw new Error("No contributions found.");
  }

  const lastDate = dates[dates.length - 1];
  const firstDate = dates[0];
  const thisWeek = getPreviousSunday(lastDate);
  const firstWeek = getPreviousSunday(firstDate);

  const stats: StreakStats = {
    mode: "weekly",
    totalContributions: 0,
    firstContribution: "",
    longestStreak: { start: firstWeek, end: firstWeek, length: 0 },
    currentStreak: { start: firstWeek, end: firstWeek, length: 0 },
    excludedDays: [],
  };

  // Group contributions by week
  const weeks: Record<string, number> = {};
  for (const date of dates) {
    const count = contributions[date];
    const week = getPreviousSunday(date);

    if (!weeks[week]) {
      weeks[week] = 0;
    }

    if (count > 0) {
      weeks[week] += count;
      // Set first contribution date (only once)
      if (!stats.firstContribution) {
        stats.firstContribution = date;
      }
    }
  }

  // Calculate weekly streaks
  const weekKeys = Object.keys(weeks);
  for (const week of weekKeys) {
    const count = weeks[week];
    stats.totalContributions += count;

    if (count > 0) {
      stats.currentStreak.length++;
      stats.currentStreak.end = week;

      if (stats.currentStreak.length === 1) {
        stats.currentStreak.start = week;
      }

      if (stats.currentStreak.length > stats.longestStreak.length) {
        stats.longestStreak.start = stats.currentStreak.start;
        stats.longestStreak.end = stats.currentStreak.end;
        stats.longestStreak.length = stats.currentStreak.length;
      }
    }
    // Reset streak — exception for the current week
    else if (week !== thisWeek) {
      stats.currentStreak.length = 0;
      stats.currentStreak.start = thisWeek;
      stats.currentStreak.end = thisWeek;
    }
  }

  return stats;
}

/**
 * Format a Date object to YYYY-MM-DD string (UTC).
 *
 * @param d - Date object
 * @returns Formatted date string
 */
function formatDate(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
