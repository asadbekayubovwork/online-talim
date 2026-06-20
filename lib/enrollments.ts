// Enrollment + lesson-progress API layer (client-side, JWT-protected).
//
// All endpoints require `Authorization: Bearer <token>` — handled by the shared
// `api` axios client. The backend derives the user from the token; we never
// send a userId.
//
//   POST /enrollments                 { courseId }            -> Enrollment
//   POST /lessons/:id/progress        { completed?, watchedSeconds? } -> Progress
//   GET  /enrollments/my-courses                              -> MyCoursesResponse

import api from "./axios";
import type { CourseLevel } from "./admin";

export interface MyCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  level: CourseLevel;
  isPublished: boolean;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  } | null;
  category: { id: string; name: string } | null;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  isCompleted: boolean;
}

export interface MyCoursesResponse {
  inProgress: MyCourse[];
  completed: MyCourse[];
  total: number;
}

export interface ProgressInput {
  completed?: boolean;
  watchedSeconds?: number;
}

/** Enroll the current user in a course. Throws on failure (409 = already in). */
export async function enroll(courseId: string): Promise<void> {
  await api.post("/enrollments", { courseId });
}

/** Save/upsert progress for a lesson (mark complete and/or store watch time). */
export async function saveLessonProgress(
  lessonId: string,
  input: ProgressInput
): Promise<void> {
  await api.post(`/lessons/${lessonId}/progress`, input);
}

/** The current user's enrolled courses, split into in-progress vs completed. */
export async function getMyCourses(): Promise<MyCoursesResponse> {
  const { data } = await api.get<MyCoursesResponse>("/enrollments/my-courses");
  return data;
}

export interface CourseEnrollmentSummary {
  enrolled: boolean;
  completedLessons: number;
  isCompleted: boolean;
}

/**
 * Enrollment status + progress for a single course, derived from my-courses.
 * Returns `null` when the user isn't authenticated or the request fails.
 */
export async function getCourseEnrollment(
  courseId: string
): Promise<CourseEnrollmentSummary | null> {
  try {
    const { inProgress, completed } = await getMyCourses();
    const found = [...inProgress, ...completed].find((c) => c.id === courseId);
    if (!found) return { enrolled: false, completedLessons: 0, isCompleted: false };
    return {
      enrolled: true,
      completedLessons: found.completedLessons,
      isCompleted: found.isCompleted,
    };
  } catch {
    return null;
  }
}
