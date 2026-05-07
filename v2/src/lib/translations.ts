/**
 * Interface for locale translations
 */
export interface LocaleTranslations {
  "Total Contributions": string;
  "Current Streak": string;
  "Longest Streak": string;
  "Week Streak": string;
  "Longest Week Streak": string;
  "Present": string;
  "Excluding {days}"?: string;
  rtl?: boolean;
  comma_separator?: string;
  date_format?: string;
}

/**
 * All supported translations
 * Ported from github-readme-streak-stats/src/translations.php
 */
export const TRANSLATIONS: Record<string, LocaleTranslations | string> = {
  en: {
    "Total Contributions": "Total Contributions",
    "Current Streak": "Current Streak",
    "Longest Streak": "Longest Streak",
    "Week Streak": "Week Streak",
    "Longest Week Streak": "Longest Week Streak",
    "Present": "Present",
    "Excluding {days}": "Excluding {days}",
  },
  id: {
    "Total Contributions": "Total Kontribusi",
    "Current Streak": "Aksi Saat Ini",
    "Longest Streak": "Aksi Terpanjang",
    "Week Streak": "Aksi Mingguan",
    "Longest Week Streak": "Aksi Mingguan Terpanjang",
    "Present": "Sekarang",
    "Excluding {days}": "Kecuali {days}",
  },
  ja: {
    date_format: "[Y.]n.j",
    "Total Contributions": "総ｺﾝﾄﾘﾋﾞｭｰｼｮﾝ数",
    "Current Streak": "現在のストリーク",
    "Longest Streak": "最長のストリーク",
    "Week Streak": "週間ストリーク",
    "Longest Week Streak": "最長の週間ストリーク",
    "Present": "今",
    "Excluding {days}": "{days}を除く",
    comma_separator: "・",
  },
  ko: {
    "Total Contributions": "총 기여 수",
    "Current Streak": "현재 연속 기여 수",
    "Longest Streak": "최장 연속 기여 수",
    "Week Streak": "주간 연속 기여 수",
    "Longest Week Streak": "최장 주간 연속 기여 수",
    "Present": "현재",
    "Excluding {days}": "{days}를 제외하고",
  },
  zh: "zh_Hans",
  zh_Hans: {
    "Total Contributions": "合计贡献",
    "Current Streak": "目前连续贡献",
    "Longest Streak": "最长连续贡献",
    "Week Streak": "周连续贡献",
    "Longest Week Streak": "最长周连续贡献",
    "Present": "至今",
    "Excluding {days}": "除外 {days}",
    comma_separator: "、",
  },
  ar: {
    rtl: true,
    "Total Contributions": "إجمالي المساهمات",
    "Current Streak": "السلسلة المتتالية الحالية",
    "Longest Streak": "أُطول سلسلة متتالية",
    "Week Streak": "السلسلة المتتالية الأُسبوعية",
    "Longest Week Streak": "أُطول سلسلة متتالية أُسبوعية",
    "Present": "الحاضر",
    "Excluding {days}": "باستثناء {days}",
    comma_separator: "، ",
  },
  // Add more locales here...
};

/**
 * Normalize a locale code
 * @param localeCode Locale code to normalize
 * @returns Normalized locale code (e.g. en_US, id, ja)
 */
export function normalizeLocaleCode(localeCode: string): string {
  const matches = localeCode.match(
    /^([a-z]{2,3})(?:[_-]([a-z]{4}))?(?:[_-]([0-9]{3}|[a-z]{2}))?$/i
  );
  if (!matches) {
    return "en";
  }
  const language = matches[1].toLowerCase();
  const script = matches[2] ? matches[2].charAt(0).toUpperCase() + matches[2].slice(1).toLowerCase() : "";
  const region = matches[3] ? matches[3].toUpperCase() : "";

  return [language, script, region].filter(Boolean).join("_");
}

/**
 * Get translations for a given locale code
 * @param localeCode Locale code (e.g. en, id, zh-TW)
 * @returns Translations for the locale, falling back to English for missing keys
 */
export function getTranslations(localeCode: string): LocaleTranslations {
  let normalized = normalizeLocaleCode(localeCode);

  // If the locale does not exist, try without script and region
  if (!TRANSLATIONS[normalized]) {
    normalized = normalized.split("_")[0];
  }

  let localeTranslations = TRANSLATIONS[normalized] || TRANSLATIONS.en;

  // If it's an alias (string), follow the alias
  if (typeof localeTranslations === "string") {
    localeTranslations = TRANSLATIONS[localeTranslations] as LocaleTranslations;
  }

  // Merge with English for missing keys
  return {
    ...(TRANSLATIONS.en as LocaleTranslations),
    ...(localeTranslations as LocaleTranslations),
  };
}
