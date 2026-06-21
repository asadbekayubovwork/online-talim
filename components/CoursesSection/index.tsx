"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPublishedCourses, type CatalogCourse } from "@/lib/catalog";
import { fetchCategories, type ApiCategory } from "@/lib/admin";
import CourseCard from "@/components/CourseCard";
import JsonLd from "@/components/JsonLd";
import { coursesItemListSchema } from "@/lib/structured-data";
import type { Locale } from "@/i18n/routing";

// Arabcha sub-label faqat seed qilingan yo'nalishlar uchun (slug bo'yicha).
// Yangi (boshqa) kategoriyalar uchun sub-label ko'rsatilmaydi.
const SLUG_ARABIC: Record<string, string> = {
  fiqh: "الفِقْهُ الحَنَفِيُّ وَأُصُولُهُ",
  aqida: "العَقِيدَة",
  tazkiya: "التَّزْكِيَة",
};

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-32 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-10 bg-gray-200 rounded-xl mt-4" />
      </div>
    </div>
  );
}

export default function CoursesSection() {
  const t = useTranslations("coursesSection");
  const locale = useLocale();
  const [active, setActive] = useState<"all" | string>("all");
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchPublishedCourses(), fetchCategories()])
      .then(([courseData, categoryData]) => {
        if (cancelled) return;
        setCourses(courseData);
        // Faqat e'lon qilingan kursi bor yo'nalishlar tab bo'lib chiqadi.
        setCategories(categoryData.filter((c) => c.courseCount > 0));
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    active === "all" ? courses : courses.filter((c) => c.categoryId === active);

  // Yo'nalish nomi: tarjima mavjud bo'lsa (seed qilingan slug), aks holda DB nomi.
  const labelFor = (cat: ApiCategory) =>
    t.has(`categories.${cat.slug}`) ? t(`categories.${cat.slug}`) : cat.name;

  return (
    <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      {status === "ready" && courses.length > 0 && (
        <JsonLd data={coursesItemListSchema(locale as Locale, courses)} />
      )}
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

        {/* Category filter tabs (dynamic) */}
        {status === "ready" && categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {/* "Barchasi" tugmasi */}
            <button
              onClick={() => setActive("all")}
              className={`flex flex-col items-start px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
                active === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <span>{t("filterAll")}</span>
              <span className={`text-xs mt-0.5 font-normal ${active === "all" ? "text-blue-200" : "text-gray-400"}`} dir="rtl">
                الجميع
              </span>
            </button>

            {categories.map((cat) => {
              const arabic = SLUG_ARABIC[cat.slug];
              return (
                <button
                  key={cat.id}
                  onClick={() => setActive(cat.id)}
                  className={`flex flex-col items-start px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
                    active === cat.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  <span>{labelFor(cat)}</span>
                  {arabic && (
                    <span className={`text-xs mt-0.5 font-normal ${active === cat.id ? "text-blue-200" : "text-gray-400"}`} dir="rtl">
                      {arabic}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading skeletons */}
        {status === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
            {t("loadError")}
          </div>
        )}

        {/* Empty state */}
        {status === "ready" && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
            {t("empty")}
          </div>
        )}

        {/* Course grid */}
        {status === "ready" && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
