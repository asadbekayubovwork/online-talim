"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listAdminReviews,
  moderateReview,
  type AdminReview,
  type ReviewStatus,
} from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [status, setStatus] = useState<"ALL" | ReviewStatus>("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAdminReviews()
      .then(setReviews)
      .catch((reason) => setError(getApiErrorMessage(reason, "Review’larni yuklab bo‘lmadi")))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return reviews.filter((review) => {
      const statusMatch = status === "ALL" || review.status === status;
      const searchMatch =
        !search ||
        review.courseTitle.toLowerCase().includes(search) ||
        review.userName.toLowerCase().includes(search) ||
        review.userEmail.toLowerCase().includes(search) ||
        review.body.toLowerCase().includes(search);
      return statusMatch && searchMatch;
    });
  }, [reviews, query, status]);

  async function changeStatus(review: AdminReview, next: ReviewStatus) {
    setSaving(review.id);
    setError(null);
    try {
      const updated = await moderateReview(review.id, next);
      setReviews((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Review holatini yangilab bo‘lmadi"));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-semibold text-blue-600">Sifat nazorati</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">Review va baholar</h1>
        <p className="mt-2 text-sm text-slate-500">Haqoratli yoki aloqasiz fikrlarni yashiring, foydali review’larni e’lon qiling.</p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kurs, talaba yoki review matni…" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        <select value={status} onChange={(event) => setStatus(event.target.value as "ALL" | ReviewStatus)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
          <option value="ALL">Barcha review’lar</option>
          <option value="PUBLISHED">E’lon qilingan</option>
          <option value="HIDDEN">Yashirilgan</option>
        </select>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Yuklanmoqda…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">Review topilmadi.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-slate-950">{review.courseTitle}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${review.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{review.status === "PUBLISHED" ? "E’lon qilingan" : "Yashirilgan"}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{review.userName} · {review.userEmail} · {new Date(review.createdAt).toLocaleDateString("uz-UZ")}</p>
                </div>
                <div className="shrink-0 text-amber-400" aria-label={`${review.rating} yulduz`}>{"★".repeat(review.rating)}<span className="text-slate-200">{"★".repeat(5 - review.rating)}</span></div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{review.body}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" disabled={saving === review.id || review.status === "PUBLISHED"} onClick={() => changeStatus(review, "PUBLISHED")} className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40">E’lon qilish</button>
                <button type="button" disabled={saving === review.id || review.status === "HIDDEN"} onClick={() => changeStatus(review, "HIDDEN")} className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-40">Yashirish</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
