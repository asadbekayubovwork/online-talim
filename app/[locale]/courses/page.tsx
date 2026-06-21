"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { fetchPublishedCourses, type CatalogCourse } from "@/lib/catalog";

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-32 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-10 bg-gray-200 rounded-xl mt-4" />
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const tNav = useTranslations("nav");
  const tCourses = useTranslations("coursesSection");

  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    fetchPublishedCourses()
      .then((data) => {
        if (cancelled) return;
        setCourses(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 sm:mb-10">
            {tNav("courses")}
          </h1>

          {/* Section heading */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {tCourses("filterAll")}
              {status === "ready" && (
                <span className="text-sm font-normal text-gray-400 ml-2">({courses.length})</span>
              )}
            </h2>
          </div>

          {/* Loading */}
          {status === "loading" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
              {tCourses("loadError")}
            </div>
          )}

          {/* Empty */}
          {status === "ready" && courses.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
              {tCourses("empty")}
            </div>
          )}

          {/* Grid */}
          {status === "ready" && courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
