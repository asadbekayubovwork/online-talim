"use client";

import { useLocale } from "next-intl";
import Link from "next/link";

const departments = [
  { href: "/courses?cat=tayyorlov", label: "Iftoga tayyorlov", arabic: "قسم التأهيل للإفتاء" },
  { href: "/courses?cat=ifto", label: "Ifto bo'limi", arabic: "قسم الإفتاء" },
  { href: "/courses?cat=ijoza", label: "Ijoza kurslari", arabic: "قسم دورات الإجازة" },
  { href: "/courses?cat=umumiy", label: "Umumiy kurslar", arabic: "قسم الدورات العامة" },
];

const quickLinks = [
  { href: "/courses", label: "Barcha kurslar" },
  { href: "/about", label: "Biz haqimizda" },
  { href: "/contact", label: "Aloqa" },
  { href: "/login", label: "Kirish" },
];

export default function Footer() {
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-lg">
                Online <span className="text-blue-400">Ta&apos;lim</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Islomiy ilmlar bo'yicha onlayn ta'lim platformasi. Tayyorlovdan Muftiy darajasigacha.
            </p>
            <p className="text-slate-500 text-sm italic" dir="rtl">
              طلب العلم فريضة على كل مسلم
            </p>
            <p className="text-slate-600 text-xs mt-1">
              "Ilm izlash har bir musulmonga farzdir."
            </p>
          </div>

          {/* Bo'limlar */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Bo'limlar</h4>
            <ul className="space-y-3">
              {departments.map((d) => (
                <li key={d.href}>
                  <Link
                    href="/"
                    className="group flex flex-col hover:text-blue-400 transition-colors"
                  >
                    <span className="text-slate-300 group-hover:text-blue-400 text-sm transition-colors">
                      {d.label}
                    </span>
                    <span className="text-slate-600 text-xs group-hover:text-blue-500 transition-colors" dir="rtl">
                      {d.arabic}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tezkor havolalar */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Havolalar</h4>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href="/"
                    className="text-slate-400 hover:text-blue-400 text-sm transition-colors flex items-center gap-1.5 group"
                  >
                    <svg className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aloqa */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Aloqa</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-slate-400 text-sm">+998 90 000 00 00</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-slate-400 text-sm">info@onlinetalim.uz</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-slate-400 text-sm">Toshkent, O'zbekiston</span>
              </li>
            </ul>

            {/* Telegram */}
            <div className="mt-5">
              <h5 className="text-slate-500 text-xs uppercase tracking-wider mb-3">Ijtimoiy tarmoqlar</h5>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-8 h-8 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Telegram"
                >
                  <svg className="w-4 h-4 text-slate-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.286c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.48 14.49 3.53 13.57c-.656-.204-.669-.656.136-.971l10.898-4.201c.546-.197 1.023.133.998.85z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-slate-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-slate-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">
            © {year} Online Ta&apos;lim. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link href="/" className="hover:text-slate-400 transition-colors">Maxfiylik siyosati</Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">Foydalanish shartlari</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
