"use client";

import { useTranslations } from "next-intl";
import { type ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* Two-tone (blue + amber) line icons matching the brand accent. */

function ScaleIcon() {
  return (
    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v15M7 20h10" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M5 7.5 2.7 12.5a2.5 2.5 0 0 0 4.6 0L5 7.5zM19 7.5l-2.3 5a2.5 2.5 0 0 0 4.6 0L19 7.5z"
        stroke="#2563eb"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5 7.5h14" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="5" r="1.7" fill="#f59e0b" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 6.6C10.8 5.8 9.2 5.3 7.5 5.3 5.8 5.3 4.2 5.8 3 6.6v12c1.2-.8 2.8-1.3 4.5-1.3 1.7 0 3.3.5 4.5 1.3m0-12c1.2-.8 2.8-1.3 4.5-1.3 1.7 0 3.3.5 4.5 1.3v12c-1.2-.8-2.8-1.3-4.5-1.3-1.7 0-3.3.5-4.5 1.3m0-12v12"
        stroke="#2563eb"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="3.6" r="1.5" fill="#f59e0b" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 20.4 10.6 19C5.4 14.3 2 11.2 2 7.5 2 5 4 3 6.5 3c1.7 0 3.3.9 4.2 2.3L12 7.1l1.3-1.8C14.2 3.9 15.8 3 17.5 3 20 3 22 5 22 7.5c0 3.7-3.4 6.8-8.6 11.5L12 20.4z"
        stroke="#2563eb"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="1.7" fill="#f59e0b" />
    </svg>
  );
}

interface Direction {
  key: "fiqh" | "aqida" | "tazkiya";
  arabic: string;
  icon: ReactNode;
}

const directions: Direction[] = [
  { key: "fiqh", arabic: "الفِقْهُ الحَنَفِيُّ وَأُصُولُهُ", icon: <ScaleIcon /> },
  { key: "aqida", arabic: "العَقِيدَة", icon: <BookIcon /> },
  { key: "tazkiya", arabic: "التَّزْكِيَة", icon: <HeartIcon /> },
];

export default function CoursesPage() {
  const tNav = useTranslations("nav");
  const tCourses = useTranslations("coursesSection");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 sm:mb-10">
            {tNav("courses")}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {directions.map((direction) => (
              <div
                key={direction.key}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 p-6 sm:p-7 flex flex-col cursor-pointer"
              >
                {/* Icon */}
                <div className="mb-5">{direction.icon}</div>

                {/* Title (uz) + subtitle (ar) */}
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                  {tCourses(`categories.${direction.key}`)}
                </h2>
                <p className="text-base text-gray-400 mt-1.5" dir="rtl">
                  {direction.arabic}
                </p>

                {/* Footer: arrow */}
                <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-100">
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
