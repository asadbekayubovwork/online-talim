"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import {
  fetchCourseDetail,
  fetchLesson,
  getAdjacent,
  type CatalogCourseDetail,
  type CatalogLesson,
} from "@/lib/catalog";
import { getCourseEnrollment, saveLessonProgress } from "@/lib/enrollments";
import { useAuth } from "@/components/AuthProvider";

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; lessonId: string }>;
}) {
  const { locale, id, lessonId } = use(params);
  const t = useTranslations("lesson");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [data, setData] = useState<CatalogCourseDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">("loading");
  // The current lesson fetched directly (`GET /lessons/:id`) — the reliable
  // source for the playable videoUrl.
  const [currentLesson, setCurrentLesson] = useState<CatalogLesson | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [marking, setMarking] = useState(false);
  // Throttle watch-time saves: remember the video position (seconds) we last
  // persisted, and only save again after it advances by >= 15s.
  const lastSavedSecRef = useRef(-Infinity);

  useEffect(() => {
    let cancelled = false;
    fetchCourseDetail(id)
      .then((res) => {
        if (cancelled) return;
        if (!res) {
          setStatus("notfound");
          return;
        }
        setData(res);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("notfound");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Fetch the lesson directly so we always have its videoUrl, even if the
  // course detail list omits it.
  useEffect(() => {
    let cancelled = false;
    fetchLesson(lessonId).then((l) => {
      if (!cancelled) setCurrentLesson(l);
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  // Resolve enrollment + how many lessons are already completed.
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    getCourseEnrollment(id).then((res) => {
      if (cancelled || !res) return;
      setEnrolled(res.enrolled);
      setCompletedCount(res.completedLessons);
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, id]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t("loading")}
        </div>
      </div>
    );
  }

  const course = data?.course;
  const lessons = data?.lessons ?? [];
  const sections = data?.sections ?? [];
  // Prefer the directly-fetched lesson (has videoUrl); fall back to the list
  // entry. Guard against a stale fetch from a previous lessonId.
  const listLesson = lessons.find((l) => l.id === lessonId);
  const lesson =
    currentLesson && currentLesson.id === lessonId ? currentLesson : listLesson;

  if (status === "notfound" || !course || !lesson) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 mb-3">{t("notFound")}</p>
          <Link
            href={`/${locale}/courses${course ? `/${course.id}` : ""}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {t("backToCourse")}
          </Link>
        </div>
      </div>
    );
  }

  const total = lessons.length;
  const completed = completedCount;
  const { prev, next } = getAdjacent(lessons, lesson.id);
  const isDone = lesson.order <= completedCount;
  const canWatch = enrolled || lesson.preview;

  const lessonHref = (lid: string) =>
    `/${locale}/courses/${course.id}/lessons/${lid}`;

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      await saveLessonProgress(lesson.id, { completed: true });
      setCompletedCount((c) => Math.max(c, lesson.order));
    } catch {
      // Keep current UI state; the user can retry.
    } finally {
      setMarking(false);
    }
  };

  // Periodically persist watch time so the video can resume later. Only the
  // <video> fallback exposes currentTime; YouTube embeds aren't tracked here.
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!enrolled) return;
    const seconds = Math.floor(e.currentTarget.currentTime);
    if (seconds - lastSavedSecRef.current < 15) return;
    lastSavedSecRef.current = seconds;
    saveLessonProgress(lesson.id, { watchedSeconds: seconds }).catch(() => {});
  };

  const renderVideo = (l: CatalogLesson) => {
    if (l.youtubeId) {
      return (
        <iframe
          key={l.id}
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${l.youtubeId}`}
          title={l.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    if (l.videoUrl) {
      return (
        <video
          key={l.id}
          className="w-full h-full"
          src={l.videoUrl}
          controls
          onTimeUpdate={handleTimeUpdate}
        />
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
        {t("noVideo")}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-slate-900 text-white flex items-center justify-between gap-3 px-4 sm:px-6 h-14 flex-shrink-0">
        <Link
          href={`/${locale}/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors min-w-0"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline truncate">{t("backToCourse")}</span>
        </Link>

        <span className="text-sm font-semibold truncate text-center flex-1">{course.title}</span>

        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="lg:hidden inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="hidden lg:block text-xs text-slate-400 w-28 text-right">
          {t("lessonsProgress", { done: completed, total })}
        </span>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* Video */}
          <div className="bg-black">
            <div className="max-w-5xl mx-auto aspect-video">
              {canWatch ? (
                renderVideo(lesson)
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center px-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-slate-300 text-sm max-w-sm">{t("lockedText")}</p>
                  <Link
                    href={`/${locale}/courses/${course.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors"
                  >
                    {t("enrollCta")}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            {/* Title + status */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-blue-600 mb-1">
                  {t("lessonLabel", { order: lesson.order })}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{lesson.title}</h1>
              </div>
              {isDone ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {t("completed")}
                </span>
              ) : enrolled ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={marking}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 border border-gray-300 hover:border-blue-500 hover:text-blue-600 disabled:opacity-60 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {marking ? t("saving") : t("markComplete")}
                </button>
              ) : null}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center justify-between gap-3 mb-8">
              {prev ? (
                <Link
                  href={lessonHref(prev.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 hover:border-blue-400 rounded-xl text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t("prev")}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={lessonHref(next.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white transition-colors"
                >
                  {t("next")}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>

            {/* About */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{t("aboutTitle")}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {lesson.description || t("aboutText")}
              </p>
            </section>

            {/* Resources */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{t("resourcesTitle")}</h2>
              <ul className="space-y-2.5">
                {[t("resourcePdf"), t("resourceAudio")].map((res) => (
                  <li key={res}>
                    <span className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm">
                      <span className="flex items-center gap-2.5 text-gray-700">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {res}
                      </span>
                      <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t("download")}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </main>

        {/* Sidebar — course content */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-80 bg-white border-l border-gray-200 flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 lg:flex-shrink-0 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between gap-2 px-4 h-14 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="font-bold text-gray-900 text-sm">{t("courseContent")}</h2>
              <p className="text-xs text-gray-400">
                {t("lessonsProgress", { done: completed, total })}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {sections.map((section) => (
              <div key={section.id}>
                <div className="px-4 py-2.5 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide sticky top-0">
                  {section.title}
                </div>
                <ul>
                  {section.lessons.map((l) => {
                    const active = l.id === lesson.id;
                    const done = l.order <= completed;
                    return (
                      <li key={l.id}>
                        <Link
                          href={lessonHref(l.id)}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors border-l-2 ${
                            active
                              ? "bg-blue-50 border-blue-600 text-blue-700 font-semibold"
                              : "border-transparent text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {done ? (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          ) : active ? (
                            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          ) : (
                            <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          )}
                          <span className="flex-1 min-w-0 truncate">
                            <span className="text-gray-400 mr-1">{l.order}.</span>
                            {l.title}
                          </span>
                          <span className="text-xs text-gray-400 tabular-nums flex-shrink-0">{l.duration}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            aria-label="Close"
          />
        )}
      </div>
    </div>
  );
}
