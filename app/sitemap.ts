import type { MetadataRoute } from "next";
import { LOCALES, localeUrl, languageAlternates } from "@/lib/seo";
import { fetchPublishedCourses } from "@/lib/catalog";

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];
type Route = { path: string; priority: number; changeFrequency: ChangeFrequency };

// Public, indexable routes (relative to the locale root). Auth routes are
// intentionally excluded — see robots.ts.
const STATIC_ROUTES: Route[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "courses", priority: 0.9, changeFrequency: "weekly" },
  { path: "about", priority: 0.6, changeFrequency: "monthly" },
  { path: "contact", priority: 0.5, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Pull live course ids from the backend. If it's unreachable at build time,
  // fall back to just the static routes rather than failing the build.
  let courseRoutes: Route[] = [];
  try {
    const courses = await fetchPublishedCourses();
    courseRoutes = courses.map((c) => ({
      path: `courses/${c.id}`,
      priority: 0.8,
      changeFrequency: "weekly",
    }));
  } catch {
    courseRoutes = [];
  }

  return [...STATIC_ROUTES, ...courseRoutes].flatMap((route) =>
    LOCALES.map((locale) => ({
      url: localeUrl(locale, route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: languageAlternates(route.path) },
    }))
  );
}
