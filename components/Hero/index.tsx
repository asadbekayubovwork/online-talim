"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

const slides = [
  {
    src: "/hero/academy-group.jpg",
    alt: "Abu-Hanifa akademiyasi talabalari",
  },
  {
    src: "/hero/academy-lecture.jpg",
    alt: "Masjiddagi dars",
  },
];

const INTERVAL = 5000;

export default function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (animating || index === current) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 400);
    },
    [animating, current]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Overlay: top (navbar zone) + bottom (buttons zone) */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Bottom-left — action buttons + dots */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-6 sm:px-10 lg:px-16 pb-12">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-6 flex-wrap">

          {/* Title + Description + Buttons */}
          <div className="flex flex-col gap-5 max-w-2xl">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3 drop-shadow-lg">
                {t("title")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  {t("titleHighlight")}
                </span>
                {t("titleEnd") ? ` ${t("titleEnd")}` : ""}
              </h1>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-xl drop-shadow">
                {t("description")}
              </p>
            </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-2xl shadow-lg shadow-blue-900/50 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("startLearning")}
            </Link>

            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/15 border border-white/40 text-white text-base font-semibold rounded-2xl backdrop-blur-sm cursor-pointer"
            >
              {t("viewCourses")}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          </div>

          {/* Slide indicators */}
          <div className="flex items-center gap-2 pb-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 h-2.5 bg-white"
                    : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => next()}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
