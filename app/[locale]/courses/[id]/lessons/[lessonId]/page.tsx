"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import LessonAssessment from "@/components/learning/LessonAssessment";
import SecureVideo from "@/components/learning/SecureVideo";
import YouTubeVideo from "@/components/learning/YouTubeVideo";
import { getApiErrorMessage } from "@/lib/auth";
import {
  fetchCourseDetail,
  getAdjacent,
  type CatalogCourseDetail,
} from "@/lib/catalog";
import { getCourseEnrollment } from "@/lib/enrollments";
import { saveProtectedProgress } from "@/lib/learning";

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; lessonId: string }>;
}) {
  const { locale, id: courseId, lessonId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<CatalogCourseDetail | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    const response = await fetchCourseDetail(courseId);
    setData(response);
  }, [courseId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCourseDetail(courseId)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((reason) => {
        if (active) setError(getApiErrorMessage(reason, "Kursni yuklab bo‘lmadi"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (authLoading || !user) {
      setEnrolled(false);
      return;
    }
    let active = true;
    getCourseEnrollment(courseId).then((summary) => {
      if (active) setEnrolled(Boolean(summary?.enrolled));
    });
    return () => {
      active = false;
    };
  }, [authLoading, user, courseId]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-sm text-slate-300">
        <span className="inline-flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Dars yuklanmoqda…
        </span>
      </div>
    );
  }

  const course = data?.course;
  const lesson = data?.lessons.find((item) => item.id === lessonId);

  if (!course || !lesson) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Dars topilmadi</h1>
          <Link href={`/${locale}/courses/${courseId}`} className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
            Kursga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const { prev, next } = getAdjacent(data.lessons, lesson.id);
  const canWatch = !lesson.locked && (enrolled || lesson.preview);
  const completedCount = data.lessons.filter((item) => item.completed).length;
  const progressPercent = data.lessons.length
    ? Math.round((completedCount / data.lessons.length) * 100)
    : 0;

  async function markComplete() {
    setMarking(true);
    setError(null);
    try {
      await saveProtectedProgress(lessonId, { completed: true });
      await loadCourse();
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Darsni yakunlab bo‘lmadi. Videoning kamida 90 foizini ko‘ring."));
    } finally {
      setMarking(false);
    }
  }

  const lessonHref = (targetId: string) =>
    `/${locale}/courses/${course.id}/lessons/${targetId}`;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-100">
      <header className="flex h-16 shrink-0 items-center gap-4 bg-slate-950 px-4 text-white sm:px-6">
        <Link href={`/${locale}/courses/${course.id}`} className="shrink-0 text-sm text-slate-300 hover:text-white">
          ← Kursga qaytish
        </Link>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold">{course.title}</p>
        <button type="button" onClick={() => setSidebarOpen((value) => !value)} className="rounded-lg border border-white/20 px-3 py-2 text-xs lg:hidden">
          Darslar
        </button>
        <div className="hidden w-28 text-right text-xs text-slate-400 lg:block">{progressPercent}% yakunlandi</div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="bg-black">
            <div className="mx-auto aspect-video max-w-6xl">
              {canWatch ? (
                lesson.youtubeId ? (
                  <YouTubeVideo
                    key={lesson.id}
                    lessonId={lesson.id}
                    videoId={lesson.youtubeId}
                    trackProgress={Boolean(user)}
                    onCompleted={loadCourse}
                  />
                ) : lesson.videoAssetId ? (
                  <SecureVideo lessonId={lesson.id} onCompleted={loadCourse} />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-slate-400">Bu darsga video hali biriktirilmagan.</div>
                )
              ) : (
                <div className="grid h-full place-items-center px-6 text-center text-slate-300">
                  <div>
                    <div className="text-4xl">🔒</div>
                    <p className="mt-4 max-w-md text-sm leading-6">
                      {lesson.locked
                        ? "Avval oldingi darsni va majburiy testni yakunlang."
                        : "Ushbu darsni ko‘rish uchun kursga yoziling."}
                    </p>
                    {!user && (
                      <Link href={`/${locale}/login`} className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
                        Kirish
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Dars</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{lesson.title}</h1>
                {lesson.description && <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{lesson.description}</p>}
              </div>
              {lesson.completed ? (
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">✓ Yakunlangan</span>
              ) : canWatch && user ? (
                <button type="button" onClick={markComplete} disabled={marking} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 disabled:opacity-50">
                  {marking ? "Tekshirilmoqda…" : "Darsni yakunlash"}
                </button>
              ) : null}
            </div>

            {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {canWatch && user && <LessonAssessment lessonId={lesson.id} onPassed={loadCourse} />}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
              {prev ? (
                <Link href={lessonHref(prev.id)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">
                  ← Oldingi dars
                </Link>
              ) : <span />}
              {next && !next.locked ? (
                <Link href={lessonHref(next.id)} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                  Keyingi dars →
                </Link>
              ) : next ? (
                <span className="cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500">🔒 Keyingi dars</span>
              ) : null}
            </div>
          </div>
        </main>

        <aside className={`${sidebarOpen ? "fixed inset-y-16 right-0 z-30 flex" : "hidden"} w-80 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white lg:static lg:flex`}>
          <div className="shrink-0 border-b border-slate-200 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-950">Kurs tarkibi</span>
              <span className="text-slate-400">{completedCount}/{data.lessons.length}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
            {data.sections.map((section) => (
              <div key={section.id} className="mb-5">
                <h2 className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-400">{section.title}</h2>
                <div className="space-y-1">
                  {section.lessons.map((item) => {
                    const active = item.id === lesson.id;
                    return (
                      <Link
                        key={item.id}
                        href={item.locked ? "#" : lessonHref(item.id)}
                        aria-disabled={item.locked}
                        onClick={(event) => {
                          if (item.locked) event.preventDefault();
                          else setSidebarOpen(false);
                        }}
                        className={`flex items-start gap-3 rounded-xl px-3 py-3 text-sm transition ${active ? "bg-blue-50 text-blue-800" : item.locked ? "cursor-not-allowed bg-slate-50 text-slate-400" : "text-slate-700 hover:bg-slate-50"}`}
                      >
                        <span className="mt-0.5 shrink-0">{item.completed ? "✓" : item.locked ? "🔒" : "○"}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium leading-5">{item.title}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
