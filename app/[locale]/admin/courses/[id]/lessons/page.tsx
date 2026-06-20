"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  deleteLesson,
  getCourse,
  listLessons,
  type ApiLesson,
} from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";

function fmtDuration(sec: number): string {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CourseLessonsPage() {
  const locale = useLocale();
  const { id: courseId } = useParams<{ id: string }>();

  const [courseTitle, setCourseTitle] = useState("");
  const [lessons, setLessons] = useState<ApiLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCourse(courseId), listLessons(courseId)])
      .then(([course, ls]) => {
        setCourseTitle(course.title);
        setLessons(ls);
      })
      .catch((e) => setError(getApiErrorMessage(e, "Darslarni yuklab bo'lmadi")))
      .finally(() => setLoading(false));
  }, [courseId]);

  async function handleDelete(l: ApiLesson) {
    if (!confirm(`"${l.title}" darsini o'chirishni tasdiqlaysizmi?`)) return;
    setDeleting(l.id);
    try {
      await deleteLesson(l.id);
      setLessons((prev) => prev.filter((x) => x.id !== l.id));
    } catch (e) {
      alert(getApiErrorMessage(e, "O'chirishda xatolik"));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <Link
        href={`/${locale}/admin/courses`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        ← Kurslar
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Darslar</h1>
          <p className="text-gray-500 text-sm">
            {courseTitle && <span className="font-medium">{courseTitle}</span>} · {lessons.length} ta dars
          </p>
        </div>
        <Link
          href={`/${locale}/admin/courses/${courseId}/lessons/new`}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          + Dars (video) qo'shish
        </Link>
      </div>

      {error && (
        <div className="px-4 py-3 mb-6 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Yuklanmoqda...</p>
        ) : lessons.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500 mb-4">Hali dars qo'shilmagan.</p>
            <Link
              href={`/${locale}/admin/courses/${courseId}/lessons/new`}
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Birinchi darsni qo'shing
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {lessons.map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50"
              >
                <span className="w-8 h-8 shrink-0 rounded-lg bg-gray-100 text-gray-500 text-sm font-semibold flex items-center justify-center">
                  {l.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {l.title}
                    {l.isPreview && (
                      <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 align-middle">
                        Bepul
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {fmtDuration(l.duration)}
                    {l.videoUrl ? " · video bor" : l.locked ? " · video (yopiq)" : " · video yo'q"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/${locale}/admin/courses/${courseId}/lessons/${l.id}`}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Tahrirlash
                  </Link>
                  <button
                    onClick={() => handleDelete(l)}
                    disabled={deleting === l.id}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {deleting === l.id ? "..." : "O'chirish"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
