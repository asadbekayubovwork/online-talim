// Public course catalogue — backend-backed.
//
// This is the CLIENT-SIDE data layer for the public site (course grid, course
// detail, lesson player). It talks to the NestJS backend through the shared
// intercepted `api` client and maps the raw API shapes (`ApiCourse`,
// `ApiLesson`) onto the richer view-model the UI expects.
//
// The backend does not provide every field the design uses (Arabic title,
// banner icon/colour, total hours, student count for the list view). Those are
// filled with sensible fallbacks derived from the data we DO have — see the
// mappers below. When the backend starts returning them, drop the fallback.

import api from "./axios";
import type { ApiCourse, ApiLesson } from "./admin";
import type { Category, Level } from "./courses";

export type { Category, Level };

export interface CatalogCourse {
  id: string;
  title: string;
  /** Backend has no Arabic title yet — empty string, hidden by the UI. */
  arabicTitle: string;
  description: string;
  /** Teacher full name, or "" when the API omits the teacher. */
  instructor: string;
  category: Category;
  lessons: number;
  /** Total hours, derived from lesson durations. 0 when unknown (hidden). */
  hours: number;
  students: number;
  level: Level;
  /** null = free (price 0 or missing). */
  price: number | null;
  badge?: string;
  color: string;
  icon: string;
  thumbnail: string | null;
}

export interface CatalogLesson {
  id: string;
  order: number;
  title: string;
  description: string;
  /** Human duration, e.g. "12:30" or "1:05:00". */
  duration: string;
  durationSeconds: number;
  /** Extracted YouTube id (for the embed), or null. */
  youtubeId: string | null;
  videoUrl: string | null;
  preview: boolean;
}

export interface CatalogSection {
  id: number;
  title: string;
  lessons: CatalogLesson[];
}

export interface CatalogCourseDetail {
  course: CatalogCourse;
  lessons: CatalogLesson[];
  sections: CatalogSection[];
}

// ── Fallback styling per department ──────────────────────────────────────────
const CATEGORY_STYLE: Record<Category, { color: string; icon: string }> = {
  fiqh: { color: "from-teal-500 to-emerald-600", icon: "🕌" },
  aqida: { color: "from-indigo-500 to-purple-600", icon: "📖" },
  tazkiya: { color: "from-green-500 to-teal-600", icon: "🌿" },
};

// Generic section labels — the backend has no "section" concept, so the flat
// lesson list is chunked into groups purely for presentation.
const PER_SECTION = 6;
const SECTION_TITLES = [
  "Kirish moduli",
  "Asosiy qism",
  "Chuqurlashtirilgan mavzular",
  "Amaliy mashg'ulotlar",
  "Yakuniy modul",
  "Qo'shimcha materiallar",
];

// ── Field mappers ────────────────────────────────────────────────────────────

/** Best-effort map of a free-text category name onto the three departments. */
function mapCategory(name?: string | null): Category {
  const n = (name || "").toLowerCase();
  if (n.includes("aqid") || n.includes("ақид") || n.includes("عقيد")) return "aqida";
  if (n.includes("tazk") || n.includes("тазк") || n.includes("تزك")) return "tazkiya";
  return "fiqh";
}

/** Department styling (icon + gradient) for a free-text category name. */
export function styleForCategoryName(name?: string | null): {
  category: Category;
  color: string;
  icon: string;
} {
  const category = mapCategory(name);
  return { category, ...CATEGORY_STYLE[category] };
}

function mapLevel(level?: string | null): Level {
  switch ((level || "").toUpperCase()) {
    case "INTERMEDIATE":
      return "intermediate";
    case "ADVANCED":
      return "advanced";
    default:
      return "beginner";
  }
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${pad2(m)}:${pad2(sec)}`;
}

/** Pull an 11-char YouTube id out of a watch / short / embed URL. */
function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const patterns = [/[?&]v=([\w-]{11})/, /youtu\.be\/([\w-]{11})/, /embed\/([\w-]{11})/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function hoursFromSeconds(totalSeconds: number): number {
  return totalSeconds > 0 ? Math.max(1, Math.round(totalSeconds / 3600)) : 0;
}

export function mapLesson(l: ApiLesson): CatalogLesson {
  const seconds = l.duration ?? 0;
  return {
    id: l.id,
    order: l.order ?? 0,
    title: l.title,
    description: l.description ?? "",
    duration: formatDuration(seconds),
    durationSeconds: seconds,
    youtubeId: extractYouTubeId(l.videoUrl),
    videoUrl: l.videoUrl ?? null,
    preview: Boolean(l.isPreview),
  };
}

export function mapCourse(c: ApiCourse): CatalogCourse {
  const category = mapCategory(c.category?.name);
  const style = CATEGORY_STYLE[category];
  const lessonsArr = c.lessons ?? [];
  const lessonCount = c._count?.lessons ?? lessonsArr.length;
  const totalSeconds = lessonsArr.reduce((sum, l) => sum + (l.duration ?? 0), 0);
  const instructor = c.teacher
    ? `${c.teacher.firstName ?? ""} ${c.teacher.lastName ?? ""}`.trim()
    : "";

  return {
    id: c.id,
    title: c.title,
    arabicTitle: "",
    description: c.description ?? "",
    instructor,
    category,
    lessons: lessonCount,
    hours: hoursFromSeconds(totalSeconds),
    students: c._count?.enrollments ?? 0,
    level: mapLevel(c.level),
    price: !c.price ? null : c.price,
    color: style.color,
    icon: style.icon,
    thumbnail: c.thumbnail ?? null,
  };
}

/** Chunk a flat, ordered lesson list into presentation sections. */
export function groupIntoSections(lessons: CatalogLesson[]): CatalogSection[] {
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const sections: CatalogSection[] = [];
  for (let i = 0; i < sorted.length; i += PER_SECTION) {
    sections.push({
      id: sections.length + 1,
      title: SECTION_TITLES[sections.length % SECTION_TITLES.length],
      lessons: sorted.slice(i, i + PER_SECTION),
    });
  }
  return sections;
}

/** Previous / next lesson (by order) for player navigation. */
export function getAdjacent(
  lessons: CatalogLesson[],
  id: string
): { prev?: CatalogLesson; next?: CatalogLesson } {
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const i = sorted.findIndex((l) => l.id === id);
  if (i === -1) return {};
  return { prev: sorted[i - 1], next: sorted[i + 1] };
}

// ── API calls ────────────────────────────────────────────────────────────────

/** Published courses for the public grid. Throws on network failure. */
export async function fetchPublishedCourses(): Promise<CatalogCourse[]> {
  const { data } = await api.get<ApiCourse[]>("/courses");
  return (data ?? []).map(mapCourse);
}

/**
 * A single course with its lessons and presentation sections.
 * Returns `null` when the course doesn't exist or the request fails.
 */
export async function fetchCourseDetail(
  id: string
): Promise<CatalogCourseDetail | null> {
  try {
    const { data } = await api.get<ApiCourse>(`/courses/${id}`);
    if (!data) return null;

    // The detail endpoint usually embeds lessons; fall back to the dedicated
    // lessons endpoint if it doesn't.
    let apiLessons = data.lessons ?? [];
    if (apiLessons.length === 0) {
      try {
        const res = await api.get<ApiLesson[]>(`/courses/${id}/lessons`);
        apiLessons = res.data ?? [];
      } catch {
        // Leave lessons empty — the course still renders.
      }
    }

    const lessons = apiLessons.map(mapLesson).sort((a, b) => a.order - b.order);
    const course = mapCourse(data);

    // Recompute counts/hours from the real lessons we resolved.
    const totalSeconds = lessons.reduce((s, l) => s + l.durationSeconds, 0);
    if (lessons.length) course.lessons = lessons.length;
    if (totalSeconds > 0) course.hours = hoursFromSeconds(totalSeconds);

    return { course, lessons, sections: groupIntoSections(lessons) };
  } catch {
    return null;
  }
}

/**
 * A single lesson by id (`GET /lessons/:id`). This is the source of truth for
 * the playable `videoUrl` — the course detail list may omit it. Returns `null`
 * when the lesson doesn't exist or the request fails.
 */
export async function fetchLesson(id: string): Promise<CatalogLesson | null> {
  try {
    const { data } = await api.get<ApiLesson>(`/lessons/${id}`);
    return data ? mapLesson(data) : null;
  } catch {
    return null;
  }
}
