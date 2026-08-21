"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getApiErrorMessage } from "@/lib/auth";
import {
  deleteCourseReview,
  listCourseReviews,
  saveCourseReview,
  type CourseReview,
} from "@/lib/reviews";

function Stars({ value, onChange }: { value: number; onChange?: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${value} yulduz`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`text-xl leading-none ${
            star <= value ? "text-amber-400" : "text-slate-200"
          } ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          aria-label={`${star} yulduz`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function CourseReviews({
  courseId,
  canReview,
  onAverageChange,
}: {
  courseId: string;
  canReview: boolean;
  onAverageChange?: (value: number) => void;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const rows = await listCourseReviews(courseId);
    setReviews(rows);
  }, [courseId]);

  const average = useMemo(
    () =>
      reviews.length
        ? reviews.reduce((sum, row) => sum + row.rating, 0) / reviews.length
        : 0,
    [reviews],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listCourseReviews(courseId)
      .then((rows) => {
        if (!cancelled) setReviews(rows);
      })
      .catch((reason) => {
        if (!cancelled) setError(getApiErrorMessage(reason, "Baholarni yuklab bo‘lmadi"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  useEffect(() => {
    onAverageChange?.(average);
  }, [average, onAverageChange]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await saveCourseReview(courseId, { rating, body: body.trim() });
      setBody("");
      await load();
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Bahoni saqlab bo‘lmadi"));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    setError(null);
    try {
      await deleteCourseReview(courseId);
      await load();
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Bahoni o‘chirib bo‘lmadi"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5" aria-labelledby="course-reviews-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="course-reviews-title" className="text-xl font-bold text-slate-950">
            Talabalar bahosi
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {reviews.length
              ? `${average.toFixed(1)} / 5 · ${reviews.length} ta fikr`
              : "Hali baho yozilmagan"}
          </p>
        </div>
        {reviews.length > 0 && <Stars value={Math.round(average)} />}
      </div>

      {canReview && user && (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">Kursni baholang</p>
              <p className="mt-1 text-xs text-slate-500">
                Fikringiz boshqa talabalar uchun foydali bo‘ladi.
              </p>
            </div>
            <Stars value={rating} onChange={setRating} />
          </div>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            minLength={3}
            maxLength={2000}
            required
            className="min-h-28 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Kurs haqida aniq va hurmatli fikr yozing…"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              disabled={saving || body.trim().length < 3}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saqlanmoqda…" : "Bahoni saqlash"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={remove}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Mening bahomni o‘chirish
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          Yuklanmoqda…
        </div>
      ) : reviews.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{review.userName}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
                <Stars value={review.rating} />
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {review.body}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
