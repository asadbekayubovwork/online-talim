"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { listCourses, listUsers, type ApiCourse } from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";

export default function AdminDashboardPage() {
  const locale = useLocale();
  const [stats, setStats] = useState({ users: 0, courses: 0, lessons: 0 });
  const [recent, setRecent] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listUsers(), listCourses()])
      .then(([users, courses]) => {
        const lessons = courses.reduce(
          (sum, c) => sum + (c._count?.lessons ?? 0),
          0
        );
        setStats({ users: users.length, courses: courses.length, lessons });
        setRecent(courses.slice(0, 5));
      })
      .catch((e) => setError(getApiErrorMessage(e, "Ma'lumotlarni yuklab bo'lmadi")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Platforma umumiy ko'rsatkichlari</p>

      {error && (
        <div className="px-4 py-3 mb-6 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <StatCard label="Foydalanuvchilar" value={loading ? "…" : stats.users} href={`/${locale}/admin/users`} />
        <StatCard label="Kurslar" value={loading ? "…" : stats.courses} href={`/${locale}/admin/courses`} />
        <StatCard label="Darslar" value={loading ? "…" : stats.lessons} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">So'nggi kurslar</h2>
        <Link
          href={`/${locale}/admin/courses/new`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          + Kurs qo'shish
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Yuklanmoqda...</p>
        ) : recent.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Hali kurslar yo'q.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/${locale}/admin/courses/${c.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{c.title}</span>
                  <span className="text-xs text-gray-400">
                    {c._count?.lessons ?? 0} dars
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href?: string;
}) {
  const card = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 transition-colors">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}
