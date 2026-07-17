"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import QuizBuilder from "@/components/admin/QuizBuilder";

export default function LessonQuizPage() {
  const locale = useLocale();
  const { id: courseId, lessonId } = useParams<{ id: string; lessonId: string }>();

  return (
    <div>
      <Link
        href={`/${locale}/admin/courses/${courseId}/lessons`}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        ← Darslar ro‘yxati
      </Link>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Dars testi</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Talaba ushbu testdan o‘tmaguncha keyingi dars ochilmaydi. Savollarni aniq, qisqa va dars mazmuniga mos yozing.
        </p>
      </div>
      <QuizBuilder lessonId={lessonId} />
    </div>
  );
}
