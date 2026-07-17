"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  createSection,
  deleteLesson,
  deleteSection,
  getCourse,
  updateSection,
  type ApiCourse,
  type ApiLesson,
  type CourseSection,
} from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/auth";

function formatDuration(seconds: number): string {
  if (!seconds) return "Davomiylik aniqlanmoqda";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}` : `${minutes}:${String(rest).padStart(2, "0")}`;
}

function normalizeSections(course: ApiCourse): CourseSection[] {
  return (course.sections ?? [])
    .map((section) => ({ ...section, description: null, lessons: section.lessons ?? [] }))
    .sort((a, b) => a.order - b.order);
}

export default function CourseLessonsPage() {
  const locale = useLocale();
  const { id: courseId } = useParams<{ id: string }>();
  const [courseTitle, setCourseTitle] = useState("");
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const course = await getCourse(courseId);
      setCourseTitle(course.title);
      setSections(normalizeSections(course));
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Kurs tarkibini yuklab bo‘lmadi"));
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sectionTitle.trim()) return;
    setSaving("new-section");
    setError(null);
    try {
      await createSection(courseId, { title: sectionTitle.trim(), order: sections.length });
      setSectionTitle("");
      await load();
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Bo‘limni yaratib bo‘lmadi"));
    } finally {
      setSaving(null);
    }
  }

  async function renameSection(section: CourseSection, title: string) {
    if (!title.trim() || title.trim() === section.title) {
      setEditingSection(null);
      return;
    }
    setSaving(section.id);
    setError(null);
    try {
      const updated = await updateSection(courseId, section.id, { title: title.trim() });
      setSections((current) => current.map((item) => (item.id === section.id ? { ...item, ...updated } : item)));
      setEditingSection(null);
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Bo‘lim nomini yangilab bo‘lmadi"));
    } finally {
      setSaving(null);
    }
  }

  async function moveSection(section: CourseSection, direction: -1 | 1) {
    const nextOrder = section.order + direction;
    if (nextOrder < 0 || nextOrder >= sections.length) return;
    setSaving(section.id);
    setError(null);
    try {
      await updateSection(courseId, section.id, { order: nextOrder });
      await load();
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Bo‘lim tartibini yangilab bo‘lmadi"));
    } finally {
      setSaving(null);
    }
  }

  async function removeSection(section: CourseSection) {
    if (!window.confirm(`“${section.title}” bo‘limi va ichidagi darslar o‘chiriladi. Davom etasizmi?`)) return;
    setSaving(section.id);
    setError(null);
    try {
      await deleteSection(courseId, section.id);
      await load();
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Bo‘limni o‘chirib bo‘lmadi"));
    } finally {
      setSaving(null);
    }
  }

  async function removeLesson(lesson: ApiLesson) {
    if (!window.confirm(`“${lesson.title}” darsini o‘chirishni tasdiqlaysizmi?`)) return;
    setSaving(lesson.id);
    setError(null);
    try {
      await deleteLesson(lesson.id);
      setSections((current) => current.map((section) => ({
        ...section,
        lessons: section.lessons.filter((item) => item.id !== lesson.id),
      })));
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Darsni o‘chirib bo‘lmadi"));
    } finally {
      setSaving(null);
    }
  }

  const totalLessons = sections.reduce((sum, section) => sum + section.lessons.length, 0);

  return (
    <div>
      <Link href={`/${locale}/admin/courses`} className="mb-4 inline-flex text-sm font-medium text-slate-500 hover:text-slate-800">← Kurslar</Link>

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-600">Kurs arxitekturasi</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{courseTitle || "Kurs tarkibi"}</h1>
          <p className="mt-2 text-sm text-slate-500">{sections.length} ta bo‘lim · {totalLessons} ta dars</p>
        </div>
        <Link href={`/${locale}/admin/courses/${courseId}/lessons/new`} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">+ Yangi dars</Link>
      </div>

      <form onSubmit={addSection} className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <input value={sectionTitle} onChange={(event) => setSectionTitle(event.target.value)} placeholder="Yangi bo‘lim nomi, masalan: 1-modul — Kirish" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        <button disabled={saving !== null || !sectionTitle.trim()} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{saving === "new-section" ? "Yaratilmoqda…" : "+ Bo‘lim yaratish"}</button>
      </form>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Yuklanmoqda…</div>
      ) : sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">Avval kurs bo‘limini yarating.</div>
      ) : (
        <div className="space-y-5">
          {sections.map((section, sectionIndex) => (
            <section key={section.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  {editingSection === section.id ? (
                    <input
                      autoFocus
                      defaultValue={section.title}
                      disabled={saving === section.id}
                      onBlur={(event) => renameSection(section, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          renameSection(section, event.currentTarget.value);
                        }
                        if (event.key === "Escape") setEditingSection(null);
                      }}
                      className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold outline-none ring-4 ring-blue-100"
                    />
                  ) : (
                    <button type="button" onClick={() => setEditingSection(section.id)} className="text-left">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{sectionIndex + 1}-bo‘lim</p>
                      <h2 className="mt-1 font-bold text-slate-950 hover:text-blue-700">{section.title}</h2>
                    </button>
                  )}
                  <p className="mt-1 text-xs text-slate-400">{section.lessons.length} ta dars</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={saving !== null || sectionIndex === 0} onClick={() => moveSection(section, -1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30">↑ Yuqoriga</button>
                  <button type="button" disabled={saving !== null || sectionIndex === sections.length - 1} onClick={() => moveSection(section, 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30">↓ Pastga</button>
                  <button type="button" disabled={saving !== null || sections.length === 1} onClick={() => removeSection(section)} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-30">Bo‘limni o‘chirish</button>
                </div>
              </div>

              {section.lessons.length ? (
                <div className="divide-y divide-slate-100">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <article key={lesson.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">{lessonIndex + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-950">{lesson.title}</h3>
                          {lesson.isPreview && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Bepul preview</span>}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>{lesson.videoAssetId ? `Video · ${formatDuration(lesson.duration)}` : "Video yo‘q"}</span>
                          <span>{lesson.materials?.length ?? 0} ta material</span>
                          <span className={lesson.quizRequired ? "font-semibold text-amber-700" : ""}>{lesson.quizRequired ? "Majburiy test" : "Test yo‘q"}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/${locale}/admin/courses/${courseId}/lessons/${lesson.id}/quiz`} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100">Test</Link>
                        <Link href={`/${locale}/admin/courses/${courseId}/lessons/${lesson.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Tahrirlash</Link>
                        <button type="button" disabled={saving === lesson.id} onClick={() => removeLesson(lesson)} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">{saving === lesson.id ? "O‘chirilmoqda…" : "O‘chirish"}</button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">Bu bo‘limda dars yo‘q. Yangi dars yaratishda bo‘limni tanlang.</div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
