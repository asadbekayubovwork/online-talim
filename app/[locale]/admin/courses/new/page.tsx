"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import CourseForm from "@/components/admin/CourseForm";

export default function NewCoursePage() {
  const locale = useLocale();
  return (
    <div>
      <Link
        href={`/${locale}/admin/courses`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        ← Kurslar
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Yangi kurs</h1>
      <CourseForm locale={locale} />
    </div>
  );
}
