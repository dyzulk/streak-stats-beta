/**
 * Interface for theme color properties
 */
export interface Theme {
  background: string;
  border: string;
  stroke: string;
  ring: string;
  fire: string;
  currStreakNum: string;
  sideNums: string;
  currStreakLabel: string;
  sideLabels: string;
  dates: string;
  excludeDaysLabel: string;
}

/**
 * All supported themes
 * Ported from github-readme-streak-stats/src/themes.php
 */
export const THEMES: Record<string, Theme> = {
  default: {
    background: "#fffefe",
    border: "#e4e2e2",
    stroke: "#e4e2e2",
    ring: "#fb8c00",
    fire: "#fb8c00",
    currStreakNum: "#151515",
    sideNums: "#151515",
    currStreakLabel: "#fb8c00",
    sideLabels: "#151515",
    dates: "#464646",
    excludeDaysLabel: "#464646",
  },
  radical: {
    background: "#141321",
    border: "#e4e2e2",
    stroke: "#e4e2e2",
    ring: "#fe428e",
    fire: "#fe428e",
    currStreakNum: "#f8d847",
    sideNums: "#fe428e",
    currStreakLabel: "#f8d847",
    sideLabels: "#fe428e",
    dates: "#a9fef7",
    excludeDaysLabel: "#a9fef7",
  },
  tokyonight: {
    background: "#1a1b26",
    border: "#e4e2e2",
    stroke: "#e4e2e2",
    ring: "#7aa2f7",
    fire: "#7aa2f7",
    currStreakNum: "#bf91f3",
    sideNums: "#7aa2f7",
    currStreakLabel: "#bf91f3",
    sideLabels: "#7aa2f7",
    dates: "#38bdae",
    excludeDaysLabel: "#38bdae",
  },
  dark: {
    background: "#151515",
    border: "#e4e2e2",
    stroke: "#e4e2e2",
    ring: "#fb8c00",
    fire: "#fb8c00",
    currStreakNum: "#ffffff",
    sideNums: "#ffffff",
    currStreakLabel: "#fb8c00",
    sideLabels: "#ffffff",
    dates: "#9e9e9e",
    excludeDaysLabel: "#9e9e9e",
  },
  dracula: {
    background: "#282a36",
    border: "#e4e2e2",
    stroke: "#e4e2e2",
    ring: "#ff79c6",
    fire: "#ff79c6",
    currStreakNum: "#bd93f9",
    sideNums: "#ff79c6",
    currStreakLabel: "#bd93f9",
    sideLabels: "#ff79c6",
    dates: "#f8f8f2",
    excludeDaysLabel: "#f8f8f2",
  },
  nord: {
    background: "#2e3440",
    border: "#e4e2e2",
    stroke: "#e4e2e2",
    ring: "#88c0d0",
    fire: "#88c0d0",
    currStreakNum: "#b48ead",
    sideNums: "#88c0d0",
    currStreakLabel: "#b48ead",
    sideLabels: "#88c0d0",
    dates: "#d8dee9",
    excludeDaysLabel: "#d8dee9",
  },
  highcontrast: {
    background: "#000000",
    border: "#e4e2e2",
    stroke: "#e4e2e2",
    ring: "#fb8c00",
    fire: "#fb8c00",
    currStreakNum: "#ffffff",
    sideNums: "#ffffff",
    currStreakLabel: "#fb8c00",
    sideLabels: "#ffffff",
    dates: "#ffffff",
    excludeDaysLabel: "#ffffff",
  },
  // Add more themes here (Subset for now to keep file size manageable)
};

/**
 * Normalize a theme name
 * @param theme Theme name to normalize
 * @returns Normalized theme name (lowercase, underscores replaced with hyphens)
 */
export function normalizeThemeName(theme: string): string {
  return theme.toLowerCase().replace(/_/g, "-");
}
