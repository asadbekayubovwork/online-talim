import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { localeUrl, languageAlternates } from "@/lib/seo";
import CourseDetail from "@/components/CourseDetail";

// Course data is loaded client-side, so per-course metadata (title from the
// course) isn't available at request time. We still emit canonical + hreflang
// for the route and a generic, localized title.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  if (!routing.locales.includes(locale as Locale)) return {};
  const t = await getTranslations({ locale, namespace: "nav" });
  const path = `courses/${id}`;
  return {
    title: t("courses"),
    alternates: {
      canonical: localeUrl(locale as Locale, path),
      languages: languageAlternates(path),
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  // `key` remounts the client component when navigating between courses, so its
  // loading/data state resets cleanly for the new id.
  return <CourseDetail key={id} locale={locale} id={id} />;
}
