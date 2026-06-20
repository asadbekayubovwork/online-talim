"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { courses, categories, type Category, type Level } from "@/lib/courses";

// Deterministic thousands separator (space) — avoids SSR/CSR locale mismatch.
const formatNumber = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const levelColors: Record<Level, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
};

function StarRating() {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function CoursesSection() {
  const t = useTranslations("coursesSection");
  const locale = useLocale();
  const [active, setActive] = useState<"all" | Category>("all");

  const filtered = active === "all" ? courses : courses.filter((c) => c.category === active);

  return (
    <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              {t("badge")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {t("title")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {t("titleHighlight")}
              </span>
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl text-sm sm:text-base">{t("description")}</p>
          </div>
          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-sm rounded-xl transition-all duration-200 whitespace-nowrap self-start md:self-auto"
          >
            {t("viewAll")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {categories.map(({ key, arabicLabel }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex flex-col items-start px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
                active === key
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <span>{key === "all" ? t("filterAll") : t(`categories.${key}`)}</span>
              <span className={`text-xs mt-0.5 font-normal ${active === key ? "text-blue-200" : "text-gray-400"}`} dir="rtl">
                {arabicLabel}
              </span>
            </button>
          ))}
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 flex flex-col"
            >
              {/* Banner */}
              <div className={`bg-gradient-to-br ${course.color} h-32 flex items-center justify-center relative overflow-hidden`}>
                <span className="text-5xl drop-shadow-md select-none">{course.icon}</span>

                {/* Arabic title watermark */}
                <span
                  className="absolute bottom-1 right-3 text-white/20 text-lg font-bold select-none"
                  dir="rtl"
                >
                  {course.arabicTitle}
                </span>

                {course.badge && (
                  <span className="absolute top-3 right-3 text-xs font-bold bg-white/25 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
                    {course.badge}
                  </span>
                )}
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white ${
                  course.price === null ? "bg-green-500/80" : "bg-white/20 backdrop-blur-sm"
                }`}>
                  {course.price === null ? t("free") : `${formatNumber(course.price)} so'm`}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                {/* Level + stars */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelColors[course.level]}`}>
                    {t(`level.${course.level}`)}
                  </span>
                  <StarRating />
                </div>

                {/* Arabic title */}
                <p className="text-sm text-gray-400 mb-1 text-right" dir="rtl">{course.arabicTitle}</p>

                <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                  {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {course.instructor[0]}
                  </div>
                  <span className="text-xs text-gray-600 font-medium truncate">{course.instructor}</span>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    {course.lessons} {t("lessons")}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.hours} {t("hours")}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {formatNumber(course.students)} {t("students")}
                  </span>
                </div>

                {/* CTA */}
                <span className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-gray-100 text-gray-400 text-sm font-semibold rounded-xl cursor-default select-none">
                  🔒 Tez kunda
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
