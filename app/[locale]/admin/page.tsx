"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getAdminDashboard, type AdminDashboard } from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";
import { toast } from "@/components/ToastProvider";

function MetricCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{note}</p>
    </div>
  );
}

function BarChart({ rows }: { rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="space-y-4">
      {rows.length ? rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
            <span className="truncate font-medium text-slate-600">{row.label}</span>
            <span className="text-slate-400">{row.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max((row.value / max) * 100, 3)}%` }} />
          </div>
        </div>
      )) : <p className="text-sm text-slate-400">Hali ma’lumot yetarli emas.</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const locale = useLocale();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== "ADMIN") {
      setLoading(false);
      return;
    }
    getAdminDashboard()
      .then(setData)
      .catch((reason) =>
        toast.error(getApiErrorMessage(reason, "Dashboard ma’lumotlarini yuklab bo‘lmadi")),
      )
      .finally(() => setLoading(false));
  }, [authLoading, user?.role]);

  const enrollmentRows = useMemo(
    () => (data?.enrollmentsByDay ?? []).map((row) => ({ label: new Date(row.date).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" }), value: row.count })),
    [data],
  );
  const completionRows = useMemo(
    () => (data?.completionsByCourse ?? []).map((row) => ({ label: row.course, value: row.count })),
    [data],
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">Boshqaruv markazi</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">Platforma ko‘rsatkichlari</h1>
          <p className="mt-2 text-sm text-slate-500">Kurslar, talabalar va o‘zlashtirish holatini bir joydan kuzating.</p>
        </div>
        <Link href={`/${locale}/admin/courses/new`} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">+ Kurs yaratish</Link>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Foydalanuvchilar" value={loading ? "…" : data?.totalUsers ?? 0} note="Jami ro‘yxatdan o‘tganlar" />
        <MetricCard label="Faol o‘quvchilar" value={loading ? "…" : data?.activeEnrollments ?? 0} note="Hozir kurs o‘tayotganlar" />
        <MetricCard label="E’lon qilingan kurslar" value={loading ? "…" : data?.publishedCourses ?? 0} note="Talabalarga ko‘rinadigan kurslar" />
        <MetricCard label="Tayyor videolar" value={loading ? "…" : data?.readyVideos ?? 0} note="MinIO’da processing tugagan" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MetricCard label="Kursni tugatish darajasi" value={loading ? "…" : `${data?.completionRate ?? 0}%`} note="Barcha yozilishlar ichida" />
        <MetricCard label="O‘rtacha baho" value={loading ? "…" : (data?.averageRating ?? 0).toFixed(1)} note="Talabalar review’lari asosida" />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="font-bold text-slate-950">Oxirgi 14 kunlik yozilishlar</h2>
            <p className="mt-1 text-sm text-slate-500">Kunlik yangi kurs yozilishlari.</p>
          </div>
          <BarChart rows={enrollmentRows} />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="font-bold text-slate-950">Kurslar bo‘yicha yakunlash</h2>
            <p className="mt-1 text-sm text-slate-500">Eng ko‘p tugatilgan kurslar.</p>
          </div>
          <BarChart rows={completionRows} />
        </section>
      </div>
    </div>
  );
}
