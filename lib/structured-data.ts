// Schema.org structured data builders (JSON-LD).
//
// These power Google rich results for the academy and its courses. The most
// valuable for this site are:
//   - EducationalOrganization → brand ("Abu Hanifa") knowledge panel
//   - WebSite + SearchAction   → sitelinks search box
//   - Course / ItemList        → course rich results for the three departments
//     ("Hanafiy fiqhi va uning usuli darslari", "Aqida darslari", "Tazkiya darslari")

import type { Locale } from "@/i18n/routing";
import { SITE_NAME, SITE_URL, localeUrl } from "@/lib/seo";
import { courses, type Category } from "@/lib/courses";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const LOGO_URL = `${SITE_URL}/opengraph-image`;

export interface Department {
  key: Category;
  /** Localised department name — the high-value search phrase. */
  name: string;
  arabicName: string;
}

export function organizationSchema(
  locale: Locale,
  description: string,
  departments: Department[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: [
      "Abu Hanifa akademiyasi",
      "Abu-Hanifa Academy",
      "Академия Абу-Ханифа",
      "أكاديمية أبو حنيفة",
    ],
    url: localeUrl(locale),
    logo: LOGO_URL,
    image: LOGO_URL,
    description,
    email: "info@onlinetalim.uz",
    telephone: "+998900000000",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toshkent",
      addressCountry: "UZ",
    },
    areaServed: "UZ",
    knowsLanguage: ["uz", "ru", "en", "ar"],
    // Tie the three teaching departments to the organisation so the exact
    // department phrases are associated with the brand.
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: SITE_NAME,
      itemListElement: departments.map((d) => ({
        "@type": "OfferCatalog",
        name: d.name,
        alternateName: d.arabicName,
      })),
    },
  };
}

export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: localeUrl(locale),
    name: SITE_NAME,
    inLanguage: locale,
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${localeUrl(locale, "courses")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** ItemList of every course as a schema.org/Course, for course rich results. */
export function coursesItemListSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: SITE_NAME,
    itemListElement: courses.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: c.title,
        alternateName: c.arabicTitle,
        description: c.description,
        inLanguage: locale,
        url: localeUrl(locale, "courses"),
        provider: {
          "@type": "EducationalOrganization",
          name: SITE_NAME,
          "@id": ORG_ID,
        },
        offers: {
          "@type": "Offer",
          category: "Free",
          price: 0,
          priceCurrency: "UZS",
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: `PT${c.hours}H`,
        },
      },
    })),
  };
}
