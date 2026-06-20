"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { deleteCourse, listCourses, type ApiCourse } from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Boshlang'ich",
  INTERMEDIATE: "O'rta",
  ADVANCED: "Yuqori",
};

export default function AdminCoursesPage() {
  const locale = useLocale();
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listCourses()
      .then(setCourses)
      .catch((e) => setError(getApiErrorMessage(e, "Kurslarni yuklab bo'lmadi")))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(c: ApiCourse) {
    if (!confirm(`"${c.title}" kursini o'chirishni tasdiqlaysizmi? Barcha darslari ham o'chadi.`)) {
      return;
    }
    setDeleting(c.id);
    try {
      await deleteCourse(c.id);
      setCourses((prev) => prev.filter((x) => x.id !== c.id));
    } catch (e) {
      alert(getApiErrorMessage(e, "O'chirishda xatolik"));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Kurslar</h1>
          <p className="text-gray-500 text-sm">Jami: {courses.length}</p>
        </div>
        <Link
          href={`/${locale}/admin/courses/new`}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          + Kurs qo'shish
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
        ) : courses.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500 mb-4">Hali kurslar yo'q.</p>
            <Link
              href={`/${locale}/admin/courses/new`}
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Birinchi kursni yarating
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Nomi</th>
                  <th className="px-5 py-3 font-medium">Daraja</th>
                  <th className="px-5 py-3 font-medium">Narxi</th>
                  <th className="px-5 py-3 font-medium">Darslar</th>
                  <th className="px-5 py-3 font-medium">Holati</th>
                  <th className="px-5 py-3 font-medium text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{c.title}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {LEVEL_LABEL[c.level] ?? c.level}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {c.price > 0 ? `${c.price.toLocaleString()} so'm` : "Bepul"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c._count?.lessons ?? 0}</td>
                    <td className="px-5 py-3">
                      {c.isPublished ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          E'lon qilingan
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          Qoralama
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${locale}/admin/courses/${c.id}/lessons`}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Darslar
                        </Link>
                        <Link
                          href={`/${locale}/admin/courses/${c.id}`}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Tahrirlash
                        </Link>
                        <button
                          onClick={() => handleDelete(c)}
                          disabled={deleting === c.id}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {deleting === c.id ? "..." : "O'chirish"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
