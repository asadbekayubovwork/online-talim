"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import CourseReviews from "@/components/course/CourseReviews";
import { getApiErrorMessage } from "@/lib/auth";
import {
  fetchCourseDetail,
  type CatalogCourseDetail,
} from "@/lib/catalog";
import { enroll, getCourseEnrollment } from "@/lib/enrollments";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("uz-UZ").format(value);
}

export default function CourseDetail({ locale, id }: { locale: string; id: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<CatalogCourseDetail | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetchCourseDetail(id)
      .then((response) => {
        if (!active) return;
        setData(response);
        setRating(response?.course.averageRating ?? null);
      })
      .catch((reason) => active && setError(getApiErrorMessage(reason, "Kursni yuklab bo‘lmadi")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (authLoading || !user) {
      setEnrolled(false);
      return;
    }
    let active = true;
    getCourseEnrollment(id).then((summary) => {
      if (active) setEnrolled(Boolean(summary?.enrolled));
    });
    return () => {
      active = false;
    };
  }, [authLoading, user, id]);

  async function handleEnroll() {
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    setEnrolling(true);
    setError(null);
    try {
      await enroll(id);
      setEnrolled(true);
    } catch (reason) {
      const status = (reason as { response?: { status?: number } }).response?.status;
      if (status === 409) setEnrolled(true);
      else setError(getApiErrorMessage(reason, "Kursga yozilib bo‘lmadi"));
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 pt-24">
          <div className="mx-auto max-w-6xl animate-pulse px-4 py-12 sm:px-6">
            <div className="h-10 w-2/3 rounded bg-slate-200" />
            <div className="mt-4 h-5 w-1/2 rounded bg-slate-200" />
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
              <div className="h-80 rounded-2xl bg-slate-200" />
              <div className="h-72 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header />
        <main className="grid min-h-screen place-items-center bg-slate-50 px-4 pt-16 text-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Kurs topilmadi</h1>
            <Link href={`/${locale}/courses`} className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">Kurslarga qaytish</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { course, sections, lessons } = data;
  const firstAvailableLesson = lessons.find((lesson) => !lesson.locked) ?? lessons[0];
  const previewLesson = lessons.find((lesson) => lesson.preview && !lesson.locked);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <section className="bg-slate-950 pb-12 pt-28 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Link href={`/${locale}/courses`} className="text-sm text-slate-300 hover:text-white">← Barcha kurslar</Link>
            <div className="mt-7 grid items-start gap-8 lg:grid-cols-[1fr_340px]">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-600/20 px-3 py-1 text-xs font-semibold text-blue-200">{course.categoryName || "Kurs"}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">{course.level === "beginner" ? "Boshlang‘ich" : course.level === "intermediate" ? "O‘rta" : "Yuqori"}</span>
                </div>
                <h1 className="mt-5 max-w-4xl text-3xl font-extrabold tracking-tight sm:text-4xl">{course.title}</h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">{course.description}</p>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                  {rating !== null && <span className="font-semibold text-amber-300">★ {rating.toFixed(1)}</span>}
                  <span>{course.lessons} ta dars</span>
                  {course.hours > 0 && <span>{course.hours} soat</span>}
                  <span>{formatNumber(course.students)} talaba</span>
                  {course.instructor && <span>Ustoz: {course.instructor}</span>}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
                <p className="text-sm font-medium text-slate-500">Kurs narxi</p>
                <p className="mt-2 text-3xl font-extrabold">{course.price === null ? "Bepul" : `${formatNumber(course.price)} so‘m`}</p>
                {enrolled && firstAvailableLesson ? (
                  <Link href={`/${locale}/courses/${course.id}/lessons/${firstAvailableLesson.id}`} className="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">O‘qishni davom ettirish</Link>
                ) : (
                  <button type="button" onClick={handleEnroll} disabled={enrolling} className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{enrolling ? "Yozilmoqda…" : course.price === null ? "Kursga yozilish" : "Kursni olish"}</button>
                )}
                {previewLesson && !enrolled && (
                  <Link href={`/${locale}/courses/${course.id}/lessons/${previewLesson.id}`} className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Bepul darsni ko‘rish</Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-10">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <section>
              <h2 className="text-xl font-bold text-slate-950">Kurs haqida</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{course.description}</p>
            </section>

            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Kurs dasturi</h2>
                  <p className="mt-1 text-sm text-slate-500">{sections.length} ta bo‘lim · {lessons.length} ta dars</p>
                </div>
              </div>
              <div className="space-y-4">
                {sections.map((section, sectionIndex) => (
                  <article key={section.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{sectionIndex + 1}-bo‘lim</p>
                      <h3 className="mt-1 font-bold text-slate-950">{section.title}</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {section.lessons.map((lesson, lessonIndex) => {
                        const accessible = !lesson.locked && (enrolled || lesson.preview);
                        return accessible ? (
                          <Link key={lesson.id} href={`/${locale}/courses/${course.id}/lessons/${lesson.id}`} className="flex items-center gap-4 px-5 py-4 text-sm hover:bg-blue-50/40">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 font-semibold text-slate-600">{lessonIndex + 1}</span>
                            <span className="min-w-0 flex-1 font-medium text-slate-800">{lesson.title}</span>
                            <span className="shrink-0 text-xs text-slate-400">{lesson.preview ? "Bepul" : lesson.completed ? "✓ Yakunlangan" : lesson.duration}</span>
                          </Link>
                        ) : (
                          <div key={lesson.id} className="flex items-center gap-4 px-5 py-4 text-sm text-slate-400">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100">🔒</span>
                            <span className="min-w-0 flex-1 font-medium">{lesson.title}</span>
                            <span className="shrink-0 text-xs">Yopiq</span>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <CourseReviews courseId={course.id} canReview={enrolled} onAverageChange={(value) => value > 0 && setRating(value)} />
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="font-bold text-slate-950">Kurs tarkibiga kiradi</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>✓ {lessons.length} ta tartibli dars</li>
              <li>✓ Himoyalangan video materiallar</li>
              <li>✓ Yuklanadigan qo‘shimcha fayllar</li>
              <li>✓ Bilimni tekshiruvchi testlar</li>
              <li>✓ Avtomatik progress va keyingi dars nazorati</li>
            </ul>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
