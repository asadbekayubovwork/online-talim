import type { MetadataRoute } from "next";
import { LOCALES, localeUrl, languageAlternates } from "@/lib/seo";
import { courses } from "@/lib/courses";

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

// Public, indexable routes (relative to the locale root). Auth routes are
// intentionally excluded — see robots.ts.
const ROUTES: { path: string; priority: number; changeFrequency: ChangeFrequency }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "courses", priority: 0.9, changeFrequency: "weekly" },
  { path: "about", priority: 0.6, changeFrequency: "monthly" },
  { path: "contact", priority: 0.5, changeFrequency: "monthly" },
  // Each course detail page.
  ...courses.map((c) => ({
    path: `courses/${c.id}`,
    priority: 0.8,
    changeFrequency: "weekly" as ChangeFrequency,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: localeUrl(locale, route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: languageAlternates(route.path) },
    }))
  );
}
