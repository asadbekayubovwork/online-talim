import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { localeUrl, languageAlternates } from "@/lib/seo";
import {
  courses,
  getCourse,
  getCurriculum,
  getEnrollment,
  type Level,
} from "@/lib/courses";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCurriculum from "@/components/CourseCurriculum";
import JsonLd from "@/components/JsonLd";
import { courseSchema } from "@/lib/structured-data";

const levelColors: Record<Level, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
};

const formatNumber = (n: number) =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    courses.map((c) => ({ locale, id: String(c.id) }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  if (!routing.locales.includes(locale as Locale)) return {};
  const course = getCourse(Number(id));
  if (!course) return {};
  const path = `courses/${course.id}`;
  return {
    title: course.title,
    description: course.description,
    alternates: {
      canonical: localeUrl(locale as Locale, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      title: course.title,
      description: course.description,
      url: localeUrl(locale as Locale, path),
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const course = getCourse(Number(id));
  if (!course) notFound();

  const typedLocale = locale as Locale;
  const t = await getTranslations({ locale, namespace: "courseDetail" });
  const tc = await getTranslations({ locale, namespace: "coursesSection" });

  const sections = getCurriculum(course);
  const enrollment = getEnrollment(course.id);
  const completed = enrollment?.completedLessons ?? 0;
  const resumeLessonId = enrollment?.currentLessonId ?? 1;
  const learnPoints = t.raw("whatYouLearn") as string[];

  return (
    <>
      <JsonLd data={courseSchema(typedLocale, course)} />
      <Header />
      <main className="bg-gray-50 min-h-screen">
        {/* Hero band */}
        <div className="bg-slate-900 text-white pt-24 pb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t("backToCourses")}
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-600/90 text-white">
                {tc(`categories.${course.category}`)}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${levelColors[course.level]}`}>
                {tc(`level.${course.level}`)}
              </span>
              {course.badge && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/90 text-white">
                  {course.badge}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2 max-w-3xl">
              {course.title}
            </h1>
            <p className="text-xl text-slate-400 mb-4" dir="rtl">{course.arabicTitle}</p>
            <p className="text-slate-300 text-base leading-relaxed max-w-2xl mb-6">
              {course.description}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                4.9 <span className="text-slate-500">{t("rating")}</span>
              </span>
              <span>{course.lessons} {t("lessons")}</span>
              <span>{course.hours} {t("hours")}</span>
              <span>{formatNumber(course.students)} {t("students")}</span>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3 mt-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                {course.instructor[0]}
              </div>
              <div>
                <p className="text-xs text-slate-400">{t("instructor")}</p>
                <p className="text-sm font-semibold text-white">{course.instructor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-10">
              {/* What you'll learn */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t("whatYouLearnTitle")}</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {learnPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>
              </section>

              {/* About */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{t("aboutTitle")}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
              </section>

              {/* Curriculum */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{t("curriculumTitle")}</h2>
                <p className="text-sm text-gray-400 mb-4">
                  {t("curriculumSummary", {
                    sections: sections.length,
                    lessons: course.lessons,
                    hours: course.hours,
                  })}
                </p>
                <CourseCurriculum
                  sections={sections}
                  locale={locale}
                  courseId={course.id}
                  completedLessons={completed}
                />
              </section>
            </div>

            {/* Right column — sticky enroll card */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-24">
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {course.price === null ? t("free") : `${formatNumber(course.price)} so'm`}
                  </span>
                </div>

                <Link
                  href={`/${locale}/courses/${course.id}/lessons/${resumeLessonId}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors mb-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {enrollment ? t("continueCourse") : t("startCourse")}
                </Link>

                <Link
                  href={`/${locale}/courses/${course.id}/lessons/1`}
                  className="block text-center w-full py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-6"
                >
                  {t("preview")}
                </Link>

                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("includesTitle")}</h3>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  {[
                    { icon: "video", label: t("includesVideo", { hours: course.hours }) },
                    { icon: "infinity", label: t("includesLifetime") },
                    { icon: "device", label: t("includesMobile") },
                    { icon: "badge", label: t("includesCertificate") },
                  ].map((item) => (
                    <li key={item.icon} className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item.label}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-gray-100 mt-6 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t("level")}</span>
                    <span className="text-gray-700 font-medium">{tc(`level.${course.level}`)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t("language")}</span>
                    <span className="text-gray-700 font-medium">{t("languageValue")}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
