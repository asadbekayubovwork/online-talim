import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CoursesSection from "@/components/CoursesSection";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { coursesItemListSchema } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    // Absolute title keeps the rich, keyword-led home title free of the
    // "%s — Abu-Hanifa akademiyasi" template suffix.
    title: { absolute: t("title") },
    description: t("description"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <JsonLd data={coursesItemListSchema(locale as Locale)} />
      <Header />
      <main>
        <Hero />
        <CoursesSection />
      </main>
      <Footer />
    </>
  );
}
