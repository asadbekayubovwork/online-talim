"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import CourseForm from "@/components/admin/CourseForm";

export default function EditCoursePage() {
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <div>
      <Link
        href={`/${locale}/admin/courses`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        ← Kurslar
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Kursni tahrirlash</h1>
        <Link
          href={`/${locale}/admin/courses/${id}/lessons`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Darslarni boshqarish
        </Link>
      </div>
      <CourseForm locale={locale} courseId={id} />
    </div>
  );
}
