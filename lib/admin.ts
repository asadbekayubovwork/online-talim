// Admin API layer — talks to the NestJS backend using the intercepted `api`
// client (auto-attaches the bearer token and refreshes on 401).
//
// Endpoints used (all ADMIN-only writes):
//   GET    /categories                    -> ApiCategory[] (public)
//   GET    /users                         -> AdminUser[]
//   GET    /courses                       -> ApiCourse[]   (published list)
//   GET    /courses/:id                   -> ApiCourse     (with lessons[])
//   POST   /courses                       -> ApiCourse
//   PATCH  /courses/:id                   -> ApiCourse
//   DELETE /courses/:id                   -> { success }
//   GET    /courses/:courseId/lessons     -> ApiLesson[]
//   GET    /lessons/:id                   -> ApiLesson
//   POST   /courses/:courseId/lessons     -> ApiLesson
//   PATCH  /lessons/:id                   -> ApiLesson
//   DELETE /lessons/:id                   -> { success }

import api from "./axios";
import type { Role } from "./auth";

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string | null;
  city?: string | null;
  country?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  nationality?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface ApiLesson {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  videoAssetId?: string | null;
  duration: number;
  order: number;
  isPreview: boolean;
  courseId: string;
  locked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  price: number;
  level: CourseLevel;
  isPublished: boolean;
  teacherId: string;
  categoryId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  category?: { id: string; name: string } | null;
  lessons?: ApiLesson[];
  _count?: { lessons: number; enrollments: number };
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  /** E'lon qilingan kurslar soni (landing tablari faqat > 0 bo'lganlarni ko'rsatadi). */
  courseCount: number;
}

export interface CourseInput {
  title: string;
  description: string;
  thumbnail?: string;
  price?: number;
  level?: CourseLevel;
  categoryId?: string;
  isPublished?: boolean;
}

export interface LessonInput {
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  isPreview?: boolean;
}

// ── Categories ───────────────────────────────────────────────────────────────
export async function fetchCategories(): Promise<ApiCategory[]> {
  const { data } = await api.get<ApiCategory[]>("/categories");
  return data ?? [];
}

// ── Users ────────────────────────────────────────────────────────────────────
export async function listUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>("/users");
  return data;
}

// ── Courses ──────────────────────────────────────────────────────────────────
// Admin ro'yxati — barcha kurslar (qoralama + e'lon qilingan). Ommaviy
// `GET /courses` faqat e'lon qilinganlarni qaytaradi, shuning uchun bu yerda
// admin endpointidan foydalanamiz.
export async function listCourses(): Promise<ApiCourse[]> {
  const { data } = await api.get<ApiCourse[]>("/courses/admin/list");
  return data;
}

export async function getCourse(id: string): Promise<ApiCourse> {
  const { data } = await api.get<ApiCourse>(`/courses/${id}`);
  return data;
}

export async function createCourse(input: CourseInput): Promise<ApiCourse> {
  const { data } = await api.post<ApiCourse>("/courses", input);
  return data;
}

export async function updateCourse(
  id: string,
  input: Partial<CourseInput>
): Promise<ApiCourse> {
  const { data } = await api.patch<ApiCourse>(`/courses/${id}`, input);
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`);
}

// ── Lessons ──────────────────────────────────────────────────────────────────
export async function listLessons(courseId: string): Promise<ApiLesson[]> {
  const { data } = await api.get<ApiLesson[]>(`/courses/${courseId}/lessons`);
  return data;
}

export async function getLesson(id: string): Promise<ApiLesson> {
  const { data } = await api.get<ApiLesson>(`/lessons/${id}`);
  return data;
}

export async function createLesson(
  courseId: string,
  input: LessonInput
): Promise<ApiLesson> {
  const { data } = await api.post<ApiLesson>(
    `/courses/${courseId}/lessons`,
    input
  );
  return data;
}

export async function updateLesson(
  id: string,
  input: Partial<LessonInput>
): Promise<ApiLesson> {
  const { data } = await api.patch<ApiLesson>(`/lessons/${id}`, input);
  return data;
}

export async function deleteLesson(id: string): Promise<void> {
  await api.delete(`/lessons/${id}`);
}
