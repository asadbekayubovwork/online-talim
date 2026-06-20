import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import {
  SITE_NAME,
  SITE_URL,
  OG_LOCALE,
  SEO_KEYWORDS,
  TWITTER_HANDLE,
  localeUrl,
  languageAlternates,
} from "@/lib/seo";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    return {};
  }
  const t = await getTranslations({ locale, namespace: "meta" });
  const typedLocale = locale as Locale;

  // Generated branded card from app/opengraph-image.tsx. Referenced
  // explicitly (resolved against metadataBase) so it is always emitted.
  const ogImage = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: t("ogImageAlt"),
  };

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("titleDefault"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    applicationName: SITE_NAME,
    keywords: SEO_KEYWORDS[typedLocale],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "education",
    alternates: {
      canonical: localeUrl(typedLocale),
      languages: languageAlternates(),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: t("title"),
      description: t("description"),
      url: localeUrl(typedLocale),
      locale: OG_LOCALE[typedLocale],
      alternateLocale: Object.values(OG_LOCALE).filter(
        (l) => l !== OG_LOCALE[typedLocale]
      ),
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enables static rendering of this locale segment.
  setRequestLocale(locale);

  const typedLocale = locale as Locale;
  const messages = await getMessages();
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  const tCat = await getTranslations({ locale, namespace: "coursesSection.categories" });

  const departments = [
    { key: "fiqh" as const, name: tCat("fiqh"), arabicName: "الفِقْهُ الحَنَفِيُّ وَأُصُولُهُ" },
    { key: "aqida" as const, name: tCat("aqida"), arabicName: "العَقِيدَة" },
    { key: "tazkiya" as const, name: tCat("tazkiya"), arabicName: "التَّزْكِيَة" },
  ];

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <JsonLd
          data={[
            organizationSchema(typedLocale, tMeta("description"), departments),
            websiteSchema(typedLocale),
          ]}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
