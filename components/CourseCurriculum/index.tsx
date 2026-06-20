"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import type { CatalogSection } from "@/lib/catalog";

interface Props {
  sections: CatalogSection[];
  locale: string;
  courseId: string;
  /** Progress — the first N lessons (by order) are treated as completed. */
  completedLessons?: number;
}

export default function CourseCurriculum({
  sections,
  locale,
  courseId,
  completedLessons = 0,
}: Props) {
  const t = useTranslations("courseDetail");
  // Open the first section by default.
  const [open, setOpen] = useState<number[]>(sections[0] ? [sections[0].id] : []);

  const toggle = (id: number) =>
    setOpen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white overflow-hidden">
      {sections.map((section) => {
        const isOpen = open.includes(section.id);
        return (
          <div key={section.id}>
            {/* Section header */}
            <button
              onClick={() => toggle(section.id)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {section.title}
                </span>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {t("sectionLessons", { count: section.lessons.length })}
              </span>
            </button>

            {/* Lessons */}
            {isOpen && (
              <ul className="bg-gray-50/60">
                {section.lessons.map((lesson) => {
                  const done = lesson.order <= completedLessons;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/${locale}/courses/${courseId}/lessons/${lesson.id}`}
                        className="flex items-center gap-3 px-5 py-3 pl-12 hover:bg-blue-50/60 transition-colors group"
                      >
                        {/* Status icon */}
                        {done ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}

                        <span className="flex-1 min-w-0 text-sm text-gray-700 group-hover:text-blue-700 truncate">
                          <span className="text-gray-400 mr-1.5">{lesson.order}.</span>
                          {lesson.title}
                        </span>

                        {lesson.preview ? (
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
                            {t("previewBadge")}
                          </span>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}

                        <span className="text-xs text-gray-400 tabular-nums flex-shrink-0 w-12 text-right">
                          {lesson.duration}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
