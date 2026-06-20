import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import {
  enrollments,
  getCourse,
  progressPercent,
  type Course,
  type Enrollment,
} from "@/lib/courses";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function MyCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "myCourses" });

  // Resolve enrollments → courses (skip any whose course no longer exists).
  const items = enrollments
    .map((e) => ({ enrollment: e, course: getCourse(e.courseId) }))
    .filter((x): x is { enrollment: Enrollment; course: Course } => Boolean(x.course))
    .map(({ enrollment, course }) => ({
      enrollment,
      course,
      percent: progressPercent(course, enrollment.completedLessons),
    }));

  const inProgress = items.filter((x) => x.percent < 100);
  const done = items.filter((x) => x.percent >= 100);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 mt-2 mb-10">{t("subtitle")}</p>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500 mb-5">{t("empty")}</p>
              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                {t("browse")}
              </Link>
            </div>
          ) : (
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
              {done.length > 0 && (
                <Section
                  label={t("completed")}
                  items={done}
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

interface SectionItem {
  enrollment: Enrollment;
  course: Course;
  percent: number;
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
  items: SectionItem[];
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
        {items.map(({ course, enrollment, percent }) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
          >
            <Link href={`/${locale}/courses/${course.id}`}>
              <div className={`bg-gradient-to-br ${course.color} h-28 flex items-center justify-center relative`}>
                <span className="text-4xl drop-shadow-md select-none">{course.icon}</span>
                <span className="absolute bottom-1 right-3 text-white/20 text-base font-bold select-none" dir="rtl">
                  {course.arabicTitle}
                </span>
              </div>
            </Link>

            <div className="p-5 flex flex-col flex-1">
              <Link href={`/${locale}/courses/${course.id}`}>
                <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                  {course.title}
                </h3>
              </Link>
              <p className="text-xs text-gray-500 mb-4">{course.instructor}</p>

              {/* Progress */}
              <div className="mt-auto">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-gray-700">{progressLabel(percent)}</span>
                  <span className="text-gray-400">
                    {lessonsLabel(enrollment.completedLessons, course.lessons)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full ${percent >= 100 ? "bg-emerald-500" : "bg-blue-600"}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <Link
                  href={`/${locale}/courses/${course.id}/lessons/${enrollment.currentLessonId}`}
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
        ))}
      </div>
    </section>
  );
}
