"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getMyCourses, type MyCourse } from "@/lib/enrollments";
import { styleForCategoryName } from "@/lib/catalog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MyCoursesPage() {
  const t = useTranslations("myCourses");
  const locale = useLocale();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [inProgress, setInProgress] = useState<MyCourse[]>([]);
  const [completed, setCompleted] = useState<MyCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // Redirect unauthenticated users to login once the session check settles.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/${locale}/login`);
    }
  }, [authLoading, isAuthenticated, locale, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    getMyCourses()
      .then((res) => {
        if (cancelled) return;
        setInProgress(res.inProgress ?? []);
        setCompleted(res.completed ?? []);
        setTotal(res.total ?? 0);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  const isLoading = authLoading || (isAuthenticated && status === "loading");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 mt-2 mb-10">{t("subtitle")}</p>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-28 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-full mt-4" />
                    <div className="h-9 bg-gray-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && status === "error" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
              {t("loadError")}
            </div>
          )}

          {!isLoading && status === "ready" && total === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500 mb-5">{t("empty")}</p>
              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                {t("browse")}
              </Link>
            </div>
          )}

          {!isLoading && status === "ready" && total > 0 && (
            <div className="space-y-12">
              {inProgress.length > 0 && (
                <Section
                  label={t("inProgress")}
                  items={inProgress}
                  locale={locale}
                  cta={t("continue")}
                  progressLabel={(p) => t("progress", { percent: p })}
                  lessonsLabel={(done, total) => t("lessonsDone", { done, total })}
                />
              )}
              {completed.length > 0 && (
                <Section
                  label={t("completed")}
                  items={completed}
                  locale={locale}
                  cta={t("review")}
                  progressLabel={(p) => t("progress", { percent: p })}
                  lessonsLabel={(done, total) => t("lessonsDone", { done, total })}
                />
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({
  label,
  items,
  locale,
  cta,
  progressLabel,
  lessonsLabel,
}: {
  label: string;
  items: MyCourse[];
  locale: string;
  cta: string;
  progressLabel: (percent: number) => string;
  lessonsLabel: (done: number, total: number) => string;
}) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
        {label}
        <span className="text-sm font-normal text-gray-400">({items.length})</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((course) => {
          const { color, icon } = styleForCategoryName(course.category?.name);
          const percent = course.progressPercent;
          const instructor = course.teacher
            ? `${course.teacher.firstName ?? ""} ${course.teacher.lastName ?? ""}`.trim()
            : "";
          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            >
              <Link href={`/${locale}/courses/${course.id}`}>
                <div className={`bg-gradient-to-br ${color} h-28 flex items-center justify-center relative overflow-hidden`}>
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl drop-shadow-md select-none">{icon}</span>
                  )}
                </div>
              </Link>

              <div className="p-5 flex flex-col flex-1">
                <Link href={`/${locale}/courses/${course.id}`}>
                  <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                </Link>
                {instructor && <p className="text-xs text-gray-500 mb-4">{instructor}</p>}

                {/* Progress */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-gray-700">{progressLabel(percent)}</span>
                    <span className="text-gray-400">
                      {lessonsLabel(course.completedLessons, course.totalLessons)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full ${percent >= 100 ? "bg-emerald-500" : "bg-blue-600"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <Link
                    href={`/${locale}/courses/${course.id}`}
                    className={`flex items-center justify-center gap-1.5 w-full py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                      percent >= 100
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {percent < 100 && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {cta}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
