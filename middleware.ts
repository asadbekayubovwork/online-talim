import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes, metadata routes (which have no locale
  // prefix), and anything with a file extension. Without excluding
  // `opengraph-image`/`sitemap`/`robots` the i18n middleware would redirect
  // them to a locale-prefixed path and break crawlers.
  matcher: [
    "/((?!api|_next|_vercel|opengraph-image|twitter-image|icon|apple-icon|sitemap|robots|.*\\..*).*)",
  ],
};
