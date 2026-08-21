import api from "./axios";

export interface CourseReview {
  id: string;
  rating: number;
  body: string;
  userName: string;
  createdAt: string;
}

export async function listCourseReviews(courseId: string): Promise<CourseReview[]> {
  const { data } = await api.get<CourseReview[]>(`/courses/${courseId}/reviews`);
  return data ?? [];
}

export async function saveCourseReview(
  courseId: string,
  input: { rating: number; body: string },
): Promise<CourseReview> {
  const { data } = await api.put<CourseReview>(`/courses/${courseId}/reviews/me`, input);
  return data;
}

export async function deleteCourseReview(courseId: string): Promise<void> {
  await api.delete(`/courses/${courseId}/reviews/me`);
}
