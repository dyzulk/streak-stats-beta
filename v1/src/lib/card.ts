/**
 * SVG Card Generation Logic
 *
 * Ported from github-readme-streak-stats/src/card.php
 * Generates the streak statistics card in SVG format with premium animations and icons.
 */

import { Theme, THEMES, normalizeThemeName } from "./themes";
import { LocaleTranslations, getTranslations } from "./translations";
import { isValidColor } from "./colors";
import { StreakStats, isExcludedDay } from "./calculator";

/**
 * Interface for card generation parameters
 */
export interface CardParams {
  theme?: string;
  locale?: string;
  date_format?: string;
  hide_border?: string;
  border_radius?: string;
  card_width?: string;
  card_height?: string;
  hide_total_contributions?: string;
  hide_current_streak?: string;
  hide_longest_streak?: string;
  short_numbers?: string;
  mode?: string;
  // Color overrides
  background?: string;
  border?: string;
  stroke?: string;
  ring?: string;
  fire?: string;
  currStreakNum?: string;
  sideNums?: string;
  currStreakLabel?: string;
  sideLabels?: string;
  dates?: string;
  excludeDaysLabel?: string;
}

/**
 * Format date for display
 * Ported from PHP's formatDate()
 */
export function formatDate(dateString: string, format: string | null, locale: string): string {
  const date = new Date(dateString + "T00:00:00Z");
  const currentYear = new Date().getUTCFullYear();
  const dateYear = date.getUTCFullYear();

  if (format) {
    let pattern = "";
    if (dateYear === currentYear) {
      pattern = format.replace(/\[.*?\]/g, "");
    } else {
      pattern = format.replace(/[\[\]]/g, "");
    }
    return formatWithPattern(date, pattern);
  }

  const options: Intl.DateTimeFormatOptions =
    dateYear === currentYear
      ? { month: "short", day: "numeric" }
      : { year: "numeric", month: "short", day: "numeric" };

  return new Intl.DateTimeFormat(locale, options).format(date);
}

function formatWithPattern(date: Date, pattern: string): string {
  const map: Record<string, string | number> = {
    j: date.getUTCDate(),
    n: date.getUTCMonth() + 1,
    Y: date.getUTCFullYear(),
    y: String(date.getUTCFullYear()).slice(-2),
    m: String(date.getUTCMonth() + 1).padStart(2, "0"),
    d: String(date.getUTCDate()).padStart(2, "0"),
  };

  return pattern.replace(/[jnYymd]/g, (match) => String(map[match] ?? match));
}

export function formatNumber(num: number, locale: string, useShortNumbers: boolean): string {
  if (!useShortNumbers || num < 1000) {
    return new Intl.NumberFormat(locale).format(num);
  }

  const units = ["", "K", "M", "B", "T"];
  let i = 0;
  let scaled = num;
  while (scaled >= 1000 && i < units.length - 1) {
    scaled /= 1000;
    i++;
  }

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  }).format(scaled);

  return formatted + units[i];
}

/**
 * Split text into lines if it exceeds maxChars
 * Ported from PHP's splitLines()
 */
function splitLines(text: string, maxChars: number, line1Offset: number): string {
  if (maxChars > 0 && text.length > maxChars && !text.includes("\n")) {
    if (text.includes(" - ")) {
      text = text.replace(" - ", "\n- ");
    } else {
      // Simple word wrap
      const words = text.split(" ");
      let currentLine = "";
      const lines = [];
      for (const word of words) {
        if ((currentLine + word).length > maxChars) {
          lines.push(currentLine.trim());
          currentLine = word + " ";
        } else {
          currentLine += word + " ";
        }
      }
      lines.push(currentLine.trim());
      text = lines.join("\n");
    }
  }

  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const parts = escaped.split("\n");
  if (parts.length > 1) {
    return `<tspan x='0' dy='${line1Offset}'>${parts[0]}</tspan><tspan x='0' dy='16'>${parts[1]}</tspan>`;
  }
  return escaped;
}

export function getRequestedTheme(params: CardParams): Theme & { backgroundGradient?: string } {
  const selectedThemeName = normalizeThemeName(params.theme || "default");
  const theme = { ...(THEMES[selectedThemeName] || THEMES.default) };

  const props = Object.keys(theme) as Array<keyof Theme>;
  for (const prop of props) {
    const paramValue = params[prop];
    if (paramValue) {
      const cleaned = paramValue.toLowerCase();
      if (/^([a-f0-9]{3}|[a-f0-9]{4}|[a-f0-9]{6}|[a-f0-9]{8})$/.test(cleaned)) {
        theme[prop] = "#" + cleaned;
      } else if (isValidColor(cleaned)) {
        theme[prop] = cleaned;
      } else if (prop === "background" && /^-?[0-9]+,[a-f0-9]{3,8}(,[a-f0-9]{3,8})+$/.test(cleaned)) {
        theme[prop] = cleaned;
      }
    }
  }

  if (params.hide_border === "true") {
    theme.border = "#0000";
  }

  let gradient = "";
  const backgroundParts = theme.background.split(",");
  if (backgroundParts.length >= 3) {
    const angle = backgroundParts[0];
    const colors = backgroundParts.slice(1);
    theme.background = "url(#gradient)";
    gradient = `<linearGradient id='gradient' gradientTransform='rotate(${angle})' gradientUnits='userSpaceOnUse'>`;
    colors.forEach((color, index) => {
      const offset = (index * 100) / (colors.length - 1);
      gradient += `<stop offset='${offset}%' stop-color='#${color}' />`;
    });
    gradient += "</linearGradient>";
  }

  return { ...theme, backgroundGradient: gradient };
}

export function generateCard(stats: StreakStats, params: CardParams = {}): string {
  const theme = getRequestedTheme(params);
  const locale = params.locale || "en";
  const translations = getTranslations(locale);
  const direction = translations.rtl ? "rtl" : "ltr";
  const dateFormat = params.date_format || translations.date_format || null;
  const borderRadius = parseFloat(params.border_radius || "4.5");
  const shortNumbers = params.short_numbers === "true";

  const showTotal = params.hide_total_contributions !== "true";
  const showCurrent = params.hide_current_streak !== "true";
  const showLongest = params.hide_longest_streak !== "true";
  const numColumns = (showTotal ? 1 : 0) + (showCurrent ? 1 : 0) + (showLongest ? 1 : 0);

  const cardWidth = Math.max(100 * numColumns, parseInt(params.card_width || "495"));
  const cardHeight = Math.max(170, parseInt(params.card_height || "195"));
  const columnWidth = numColumns > 0 ? cardWidth / numColumns : 0;
  const heightOffset = (cardHeight - 195) / 2;

  // Offsets
  const barOffsets = [columnWidth, columnWidth * 2];
  let columnOffsets = [];
  for (let i = 0; i < numColumns; i++) {
    columnOffsets.push(columnWidth / 2 + columnWidth * i);
  }
  if (direction === "rtl") {
    columnOffsets = columnOffsets.reverse();
  }

  let nextIdx = 0;
  const totalOff = showTotal ? columnOffsets[nextIdx++] : -999;
  const currentOff = showCurrent ? columnOffsets[nextIdx++] : -999;
  const longestOff = showLongest ? columnOffsets[nextIdx++] : -999;

  const sideHOff = [48 + heightOffset, 84 + heightOffset, 114 + heightOffset];
  const currHOff = [48 + heightOffset, 108 + heightOffset, 145 + heightOffset, 71 + heightOffset, 19.5 + heightOffset];

  // Values
  const totalVal = formatNumber(stats.totalContributions, locale, shortNumbers);
  const currentVal = formatNumber(stats.currentStreak.length, locale, shortNumbers);
  const longestVal = formatNumber(stats.longestStreak.length, locale, shortNumbers);

  const totalRange = `${formatDate(stats.firstContribution, dateFormat, locale)} - ${translations["Present"]}`;
  const currentRange = stats.currentStreak.start === stats.currentStreak.end 
    ? formatDate(stats.currentStreak.start, dateFormat, locale)
    : `${formatDate(stats.currentStreak.start, dateFormat, locale)} - ${formatDate(stats.currentStreak.end, dateFormat, locale)}`;
  const longestRange = stats.longestStreak.start === stats.longestStreak.end
    ? formatDate(stats.longestStreak.start, dateFormat, locale)
    : `${formatDate(stats.longestStreak.start, dateFormat, locale)} - ${formatDate(stats.longestStreak.end, dateFormat, locale)}`;

  const maxCharsLabel = numColumns > 0 ? Math.floor(cardWidth / numColumns / 7.5) : 0;
  const totalText = splitLines(translations["Total Contributions"], maxCharsLabel, -9);
  const currentText = splitLines(stats.mode === "weekly" ? translations["Week Streak"] : translations["Current Streak"], maxCharsLabel, -9);
  const longestText = splitLines(stats.mode === "weekly" ? translations["Longest Week Streak"] : translations["Longest Streak"], maxCharsLabel, -9);

  const maxCharsDates = numColumns > 0 ? Math.floor(cardWidth / numColumns / 6) : 0;
  const totalRangeSplit = splitLines(totalRange, maxCharsDates, 0);
  const currentRangeSplit = splitLines(currentRange, maxCharsDates, 0);
  const longestRangeSplit = splitLines(longestRange, maxCharsDates, 0);

  // Excluded days note
  let excludedDaysNote = "";
  if (stats.excludedDays && stats.excludedDays.length > 0) {
    const separator = translations.comma_separator || ", ";
    const daysText = stats.excludedDays.join(separator);
    const excludingText = (translations["Excluding {days}"] || "Excluding {days}").replace("{days}", daysText);
    const offset = direction === "rtl" ? cardWidth - 5 : 5;
    excludedDaysNote = `
      <g style="isolation: isolate">
        <g transform="translate(${offset}, ${cardHeight - 8})">
          <text text-anchor="${direction === "rtl" ? "end" : "start"}" fill="${theme.excludeDaysLabel}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="10px" style="opacity: 0; animation: fadein 0.5s linear forwards 0.9s">
            * ${excludingText}
          </text>
        </g>
      </g>`;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation: isolate" viewBox="0 0 ${cardWidth} ${cardHeight}" width="${cardWidth}px" height="${cardHeight}px" direction="${direction}">
  <style>
    @keyframes currstreak {
      0% { font-size: 3px; opacity: 0.2; }
      80% { font-size: 34px; opacity: 1; }
      100% { font-size: 28px; opacity: 1; }
    }
    @keyframes fadein {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  </style>
  <defs>
    <clipPath id="outer_rectangle">
      <rect width="${cardWidth}" height="${cardHeight}" rx="${borderRadius}"/>
    </clipPath>
    <mask id="mask_out_ring_behind_fire">
      <rect width="${cardWidth}" height="${cardHeight}" fill="white"/>
      <ellipse id="mask-ellipse" cx="${currentOff}" cy="32" rx="13" ry="18" fill="black"/>
    </mask>
    ${theme.backgroundGradient || ""}
  </defs>
  <g clip-path="url(#outer_rectangle)">
    <rect stroke="${theme.border}" fill="${theme.background}" rx="${borderRadius}" x="0.5" y="0.5" width="${cardWidth - 1}" height="${cardHeight - 1}"/>
    <g>
      ${numColumns > 1 ? `<line x1="${barOffsets[0]}" y1="${28 + heightOffset / 2}" x2="${barOffsets[0]}" y2="${170 + heightOffset}" stroke="${theme.stroke}" stroke-width="1"/>` : ""}
      ${numColumns > 2 ? `<line x1="${barOffsets[1]}" y1="${28 + heightOffset / 2}" x2="${barOffsets[1]}" y2="${170 + heightOffset}" stroke="${theme.stroke}" stroke-width="1"/>` : ""}
    </g>
    ${showTotal ? `
    <g transform="translate(${totalOff}, ${sideHOff[0]})">
      <text x="0" y="32" text-anchor="middle" fill="${theme.sideNums}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" font-size="28px" style="opacity: 0; animation: fadein 0.5s linear forwards 0.6s">${totalVal}</text>
    </g>
    <g transform="translate(${totalOff}, ${sideHOff[1]})">
      <text x="0" y="32" text-anchor="middle" fill="${theme.sideLabels}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="14px" style="opacity: 0; animation: fadein 0.5s linear forwards 0.7s">${totalText}</text>
    </g>
    <g transform="translate(${totalOff}, ${sideHOff[2]})">
      <text x="0" y="32" text-anchor="middle" fill="${theme.dates}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="12px" style="opacity: 0; animation: fadein 0.5s linear forwards 0.8s">${totalRangeSplit}</text>
    </g>` : ""}
    ${showCurrent ? `
    <g transform="translate(${currentOff}, ${currHOff[1]})">
      <text x="0" y="32" text-anchor="middle" fill="${theme.currStreakLabel}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" font-size="14px" style="opacity: 0; animation: fadein 0.5s linear forwards 0.9s">${currentText}</text>
    </g>
    <g transform="translate(${currentOff}, ${currHOff[2]})">
      <text x="0" y="21" text-anchor="middle" fill="${theme.dates}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="12px" style="opacity: 0; animation: fadein 0.5s linear forwards 0.9s">${currentRangeSplit}</text>
    </g>
    <g mask="url(#mask_out_ring_behind_fire)">
      <circle cx="${currentOff}" cy="${currHOff[3]}" r="40" fill="none" stroke="${theme.ring}" stroke-width="5" style="opacity: 0; animation: fadein 0.5s linear forwards 0.4s"/>
    </g>
    <g transform="translate(${currentOff}, ${currHOff[4]})" style="opacity: 0; animation: fadein 0.5s linear forwards 0.6s">
      <path d="M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z M -0.29 19 C -2.07 19 -3.51 17.6 -3.51 15.86 C -3.51 14.24 -2.46 13.1 -0.7 12.74 C 1.07 12.38 2.9 11.53 3.92 10.16 C 4.31 11.45 4.51 12.81 4.51 14.2 C 4.51 16.85 2.36 19 -0.29 19 Z" fill="${theme.fire}"/>
    </g>
    <g transform="translate(${currentOff}, ${currHOff[0]})">
      <text x="0" y="32" text-anchor="middle" fill="${theme.currStreakNum}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" font-size="28px" style="animation: currstreak 0.6s linear forwards">${currentVal}</text>
    </g>` : ""}
    ${showLongest ? `
    <g transform="translate(${longestOff}, ${sideHOff[0]})">
      <text x="0" y="32" text-anchor="middle" fill="${theme.sideNums}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="700" font-size="28px" style="opacity: 0; animation: fadein 0.5s linear forwards 1.2s">${longestVal}</text>
    </g>
    <g transform="translate(${longestOff}, ${sideHOff[1]})">
      <text x="0" y="32" text-anchor="middle" fill="${theme.sideLabels}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="14px" style="opacity: 0; animation: fadein 0.5s linear forwards 1.3s">${longestText}</text>
    </g>
    <g transform="translate(${longestOff}, ${sideHOff[2]})">
      <text x="0" y="32" text-anchor="middle" fill="${theme.dates}" font-family="'Segoe UI', Ubuntu, sans-serif" font-weight="400" font-size="12px" style="opacity: 0; animation: fadein 0.5s linear forwards 1.4s">${longestRangeSplit}</text>
    </g>` : ""}
    ${excludedDaysNote}
  </g>
</svg>
  `.trim();
}
