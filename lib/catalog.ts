// Backend-backed course catalogue. Presentation components remain unchanged;
// this mapper only adapts the FastAPI course/section/lesson response.
import api from "./axios";
import type { ApiCourse, ApiLesson } from "./admin";
import type { Category, Level } from "./courses";
import { extractYoutubeId } from "./youtube";

export type { Category, Level };

export interface CatalogCourse {
  id: string;
  title: string;
  arabicTitle: string;
  description: string;
  instructor: string;
  category: Category;
  categoryId: string | null;
  categoryName: string;
  lessons: number;
  hours: number;
  students: number;
  level: Level;
  price: number | null;
  badge?: string;
  color: string;
  icon: string;
  thumbnail: string | null;
  averageRating: number | null;
}

export interface CatalogLesson {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: string;
  durationSeconds: number;
  youtubeId: string | null;
  videoUrl: string | null;
  videoAssetId: string | null;
  preview: boolean;
  locked: boolean;
  completed: boolean;
  quizRequired: boolean;
  quizPassed: boolean;
}

export interface CatalogSection {
  id: string;
  title: string;
  lessons: CatalogLesson[];
}

export interface CatalogCourseDetail {
  course: CatalogCourse;
  lessons: CatalogLesson[];
  sections: CatalogSection[];
}

const CATEGORY_STYLE: Record<Category, { color: string; icon: string }> = {
  fiqh: { color: "from-teal-500 to-emerald-600", icon: "🕌" },
  aqida: { color: "from-indigo-500 to-purple-600", icon: "📖" },
  tazkiya: { color: "from-green-500 to-teal-600", icon: "🌿" },
};

// Fallback labels only. The backend does have real sections; these are used
// when a course predates them and returns nothing but a flat lesson list.
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
  const normalized = (name || "").toLowerCase();
  if (normalized.includes("aqid") || normalized.includes("عقيد")) return "aqida";
  if (normalized.includes("tazk") || normalized.includes("تزك")) return "tazkiya";
  return "fiqh";
}

export function styleForCategoryName(name?: string | null): {
  category: Category;
  color: string;
  icon: string;
} {
  const category = mapCategory(name);
  return { category, ...CATEGORY_STYLE[category] };
}

function mapLevel(level?: string | null): Level {
  if (level === "INTERMEDIATE") return "intermediate";
  if (level === "ADVANCED") return "advanced";
  return "beginner";
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours ? `${hours}:${pad2(minutes)}:${pad2(rest)}` : `${pad2(minutes)}:${pad2(rest)}`;
}

function hoursFromSeconds(totalSeconds: number): number {
  return totalSeconds > 0 ? Math.max(1, Math.round(totalSeconds / 3600)) : 0;
}

export function mapLesson(lesson: ApiLesson): CatalogLesson {
  const duration = lesson.duration ?? 0;
  return {
    id: lesson.id,
    order: lesson.order ?? 0,
    title: lesson.title,
    description: lesson.description ?? "",
    duration: formatDuration(duration),
    durationSeconds: duration,
    youtubeId: extractYoutubeId(lesson.videoUrl),
    videoUrl: lesson.videoUrl ?? null,
    videoAssetId: lesson.videoAssetId ?? null,
    preview: Boolean(lesson.isPreview),
    locked: Boolean(lesson.locked),
    completed: Boolean(lesson.completed),
    quizRequired: Boolean(lesson.quizRequired),
    quizPassed: Boolean(lesson.quizPassed),
  };
}

function apiLessons(course: ApiCourse): ApiLesson[] {
  if (course.sections?.length) return course.sections.flatMap((section) => section.lessons ?? []);
  return course.lessons ?? [];
}

export function mapCourse(course: ApiCourse): CatalogCourse {
  const category = mapCategory(course.category?.name);
  const style = CATEGORY_STYLE[category];
  const lessons = apiLessons(course);
  const totalSeconds = lessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0);
  const instructor = course.teacher
    ? `${course.teacher.firstName ?? ""} ${course.teacher.lastName ?? ""}`.trim()
    : "";
  return {
    id: course.id,
    title: course.title,
    arabicTitle: "",
    description: course.description ?? "",
    instructor,
    category,
    categoryId: course.category?.id ?? course.categoryId ?? null,
    categoryName: course.category?.name ?? "",
    lessons: course.lessonCount ?? course._count?.lessons ?? lessons.length,
    hours: hoursFromSeconds(totalSeconds),
    students: course.enrollmentCount ?? course._count?.enrollments ?? 0,
    level: mapLevel(course.level),
    price: !course.price ? null : course.price,
    color: style.color,
    icon: style.icon,
    thumbnail: course.thumbnail ?? null,
    averageRating: course.averageRating ?? null,
  };
}

export function groupIntoSections(lessons: CatalogLesson[]): CatalogSection[] {
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const sections: CatalogSection[] = [];
  for (let i = 0; i < sorted.length; i += PER_SECTION) {
    sections.push({
      id: `chunk-${sections.length + 1}`,
      title: SECTION_TITLES[sections.length % SECTION_TITLES.length],
      lessons: sorted.slice(i, i + PER_SECTION),
    });
  }
  return sections;
}

/** Real curriculum: sections in their own order, lessons ordered within each. */
function mapSections(course: ApiCourse): CatalogSection[] {
  return [...(course.sections ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      id: section.id,
      title: section.title,
      lessons: [...(section.lessons ?? [])]
        .sort((a, b) => a.order - b.order)
        .map(mapLesson),
    }))
    .filter((section) => section.lessons.length > 0);
}

/** Previous / next lesson (by order) for player navigation. */
export function getAdjacent(
  lessons: CatalogLesson[],
  id: string,
): { prev?: CatalogLesson; next?: CatalogLesson } {
  const index = lessons.findIndex((lesson) => lesson.id === id);
  if (index === -1) return {};
  return { prev: lessons[index - 1], next: lessons[index + 1] };
}

export async function fetchPublishedCourses(): Promise<CatalogCourse[]> {
  const { data } = await api.get<ApiCourse[]>("/courses");
  return (data ?? []).map(mapCourse);
}

export async function fetchCourseDetail(id: string): Promise<CatalogCourseDetail | null> {
  try {
    const { data } = await api.get<ApiCourse>(`/courses/${id}`);
    if (!data) return null;

    // The detail endpoint nests lessons under the course's real sections.
    let sections = mapSections(data);

    if (sections.length === 0) {
      // Older courses expose a flat list only; chunk it for presentation.
      let apiLessons = data.lessons ?? [];
      if (apiLessons.length === 0) {
        try {
          const res = await api.get<ApiLesson[]>(`/courses/${id}/lessons`);
          apiLessons = res.data ?? [];
        } catch {
          // Leave lessons empty — the course still renders.
        }
      }
      sections = groupIntoSections(apiLessons.map(mapLesson));
    }

    // `order` restarts at 0 in every section, so the reading order is the
    // section order — never a global sort by `order`.
    const lessons = sections.flatMap((section) => section.lessons);
    const course = mapCourse(data);

    // Recompute counts/hours from the real lessons we resolved.
    const totalSeconds = lessons.reduce((s, l) => s + l.durationSeconds, 0);
    if (lessons.length) course.lessons = lessons.length;
    if (totalSeconds > 0) course.hours = hoursFromSeconds(totalSeconds);

    return { course, lessons, sections };
  } catch {
    return null;
  }
}

export async function fetchLesson(id: string): Promise<CatalogLesson | null> {
  try {
    const { data } = await api.get<ApiLesson>(`/lessons/${id}`);
    return data ? mapLesson(data) : null;
  } catch {
    return null;
  }
}
