"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const languages = [
  { code: "uz", label: "O'zbekcha" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export default function LanguageSwitcher({ scrolled = false }: { scrolled?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = languages.find((l) => l.code === locale) || languages[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLocale(code: string) {
    const segments = pathname.split("/");
    segments[1] = code;
    router.push(segments.join("/"));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-200 text-sm cursor-pointer ${
          scrolled
            ? "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
            : "border-white/25 hover:border-white/40 text-white bg-white/10"
        }`}
      >
        <span className="font-medium hidden sm:inline">{current.label}</span>
        <span className={`text-xs uppercase sm:normal-case sm:text-xs ${scrolled ? "text-gray-500 sm:text-gray-400" : "text-white/80 sm:text-white/50"}`}>
          <span className="sm:hidden">{current.code}</span>
          <span className="hidden sm:inline">({current.code})</span>
        </span>
        <svg
          className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""} ${
            scrolled ? "text-gray-400" : "text-white/50"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 cursor-pointer ${
                locale === lang.code ? "text-blue-600 bg-blue-50/60" : "text-gray-800"
              }`}
            >
              <span className={locale === lang.code ? "font-semibold" : "font-normal"}>
                {lang.label}
              </span>
              <span className="text-gray-400 text-xs">({lang.code})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
