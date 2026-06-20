import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

// Base for resolving relative metadata URLs (OG images, canonicals) on
// root-level routes such as not-found. Locale routes set their own richer
// metadata in app/[locale]/layout.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
