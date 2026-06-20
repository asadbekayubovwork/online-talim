// Centralised SEO configuration.
//
// The production origin is read from NEXT_PUBLIC_SITE_URL so it can be set per
// environment (Vercel / server) without touching code. Falls back to the
// brand domain. No trailing slash — paths are appended directly.

import type { Locale } from "@/i18n/routing";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://abu-hanifa.uz"
).replace(/\/+$/, "");

export const SITE_NAME = "Abu-Hanifa akademiyasi";

export const LOCALES: Locale[] = ["uz", "ru", "en"];
export const DEFAULT_LOCALE: Locale = "uz";

// Open Graph locale codes per app locale.
export const OG_LOCALE: Record<Locale, string> = {
  uz: "uz_UZ",
  ru: "ru_RU",
  en: "en_US",
};

// hreflang codes per app locale (BCP-47).
export const HREFLANG: Record<Locale, string> = {
  uz: "uz",
  ru: "ru",
  en: "en",
};

/**
 * Build a locale-prefixed absolute URL, e.g. ("uz", "/courses") →
 * "https://abu-hanifa.uz/uz/courses". A path of "" / "/" yields the locale root.
 */
export function localeUrl(locale: Locale, path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return `${SITE_URL}/${locale}${clean ? `/${clean}` : ""}`;
}

/**
 * `alternates.languages` map for a given path across every locale, plus an
 * `x-default` pointing at the default locale. Feed straight into Metadata.
 */
export function languageAlternates(path = ""): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[HREFLANG[locale]] = localeUrl(locale, path);
  }
  languages["x-default"] = localeUrl(DEFAULT_LOCALE, path);
  return languages;
}

// Per-locale, keyword-rich descriptions and keyword sets. These intentionally
// include the high-value search terms — the brand name and the three teaching
// departments — in each language and in Arabic.
export const SEO_KEYWORDS: Record<Locale, string[]> = {
  uz: [
    "Abu-Hanifa akademiyasi",
    "Abu Hanifa",
    "Imom Abu Hanifa",
    "Hanafiy fiqhi va uning usuli darslari",
    "Hanafiy fiqh",
    "fiqh darslari",
    "usul ul-fiqh",
    "Aqida darslari",
    "Tazkiya darslari",
    "الفقه الحنفي وأصوله",
    "onlayn islomiy ta'lim",
    "islomiy kurslar",
    "Ifto",
    "Muftiy",
    "Tajvid darslari",
    "diniy ta'lim O'zbekiston",
  ],
  ru: [
    "Академия Абу-Ханифа",
    "Абу Ханифа",
    "Имам Абу Ханифа",
    "Уроки ханафитского фикха и его основ",
    "ханафитский фикх",
    "уроки фикха",
    "усуль аль-фикх",
    "Уроки Акыды",
    "Уроки Тазкии",
    "الفقه الحنفي وأصوله",
    "исламское образование онлайн",
    "исламские курсы",
    "Ифта",
    "Муфтий",
    "уроки таджвида",
  ],
  en: [
    "Abu-Hanifa Academy",
    "Abu Hanifa",
    "Imam Abu Hanifa",
    "Hanafi Fiqh and its Principles",
    "Hanafi Fiqh",
    "Fiqh lessons",
    "Usul al-Fiqh",
    "Aqidah lessons",
    "Tazkiyah lessons",
    "الفقه الحنفي وأصوله",
    "online Islamic education",
    "Islamic courses",
    "Ifta",
    "Mufti",
    "Tajweed lessons",
  ],
};

export const TWITTER_HANDLE = "@abuhanifa";
