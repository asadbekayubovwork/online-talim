"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import LessonForm from "@/components/admin/LessonForm";

export default function EditLessonPage() {
  const locale = useLocale();
  const { id: courseId, lessonId } = useParams<{
    id: string;
    lessonId: string;
  }>();

  return (
    <div>
      <Link
        href={`/${locale}/admin/courses/${courseId}/lessons`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        ← Darslar
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">
        Darsni tahrirlash
      </h1>
      <LessonForm locale={locale} courseId={courseId} lessonId={lessonId} />
    </div>
  );
}
