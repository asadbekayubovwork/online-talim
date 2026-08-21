import axios from "axios";
import api from "./axios";
import type { Role } from "./auth";

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type AssetKind = "VIDEO" | "IMAGE" | "DOCUMENT";
export type AssetStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
export type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE";

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

export interface LessonMaterial {
  id: string;
  title: string;
  order: number;
  isDownloadable: boolean;
  assetId: string;
  contentType: string;
  sizeBytes: number;
}

export interface ApiLesson {
  id: string;
  title: string;
  description?: string | null;
  /** YouTube watch URL — the current source for new lessons. */
  videoUrl?: string | null;
  /** Legacy uploaded video; kept playable for lessons created before the switch. */
  videoAssetId?: string | null;
  duration: number;
  /** Position inside its section — not unique across the course. */
  order: number;
  isPreview: boolean;
  courseId: string;
  sectionId?: string;
  locked?: boolean;
  completed?: boolean;
  quizRequired?: boolean;
  quizPassed?: boolean;
  materials?: LessonMaterial[];
}

export interface ApiCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  price: number;
  level: CourseLevel;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
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
  /** Real curriculum from the API — lessons are nested per section. */
  sections?: Array<{
    id: string;
    title: string;
    description?: string | null;
    order: number;
    lessons?: ApiLesson[];
  }>;
  lessons?: ApiLesson[];
  sections?: Array<{
    id: string;
    title: string;
    order: number;
    lessons: ApiLesson[];
  }>;
  lessonCount?: number;
  enrollmentCount?: number;
  averageRating?: number | null;
  _count?: { lessons: number; enrollments: number };
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  courseCount: number;
}

export interface CourseInput {
  title: string;
  description: string;
  thumbnail?: string;
  price?: number;
  level?: CourseLevel;
  categoryId?: string;
  teacherId?: string;
  isPublished?: boolean;
}

export interface LessonInput {
  title: string;
  description?: string;
  sectionId?: string;
  videoUrl?: string | null;
  videoDurationSeconds?: number | null;
  videoAssetId?: string;
  order?: number;
  isPreview?: boolean;
}

export interface UploadTicket {
  assetId: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresIn: number;
}

export interface MediaAsset {
  id: string;
  kind: AssetKind;
  status: AssetStatus;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  durationSeconds?: number | null;
  errorMessage?: string | null;
}

export interface QuizChoiceInput {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface QuizQuestionInput {
  id?: string;
  type: QuestionType;
  prompt: string;
  explanation?: string;
  order: number;
  points: number;
  choices: QuizChoiceInput[];
}

export interface QuizInput {
  title: string;
  passingScore: number;
  maxAttempts?: number | null;
  requiredToUnlockNext: boolean;
  questions: QuizQuestionInput[];
}

export interface QuizAdmin extends QuizInput {
  id: string;
}

export interface CourseSection {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  lessons: ApiLesson[];
}

export type ReviewStatus = "PUBLISHED" | "HIDDEN";

export interface AdminReview {
  id: string;
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  body: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface AdminDashboard {
  totalUsers: number;
  activeEnrollments: number;
  publishedCourses: number;
  readyVideos: number;
  completionRate: number;
  averageRating: number;
  enrollmentsByDay: Array<{ date: string; count: number }>;
  completionsByCourse: Array<{ course: string; count: number }>;
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const { data } = await api.get<ApiCategory[]>("/categories");
  return data ?? [];
}

export async function createCategory(name: string): Promise<ApiCategory> {
  const { data } = await api.post<ApiCategory>("/categories", { name });
  return data;
}

export async function updateCategory(id: string, name: string): Promise<ApiCategory> {
  const { data } = await api.patch<ApiCategory>(`/categories/${id}`, { name });
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

export async function listUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>("/users");
  return data;
}

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

export async function updateCourse(id: string, input: Partial<CourseInput>): Promise<ApiCourse> {
  const { data } = await api.patch<ApiCourse>(`/courses/${id}`, input);
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`);
}

export async function listLessons(courseId: string): Promise<ApiLesson[]> {
  const { data } = await api.get<ApiLesson[]>(`/courses/${courseId}/lessons`);
  return data;
}

export async function getLesson(id: string): Promise<ApiLesson> {
  const { data } = await api.get<ApiLesson>(`/lessons/${id}`);
  return data;
}

export async function createLesson(courseId: string, input: LessonInput): Promise<ApiLesson> {
  const { data } = await api.post<ApiLesson>(`/courses/${courseId}/lessons`, input);
  return data;
}

export async function updateLesson(id: string, input: Partial<LessonInput>): Promise<ApiLesson> {
  const { data } = await api.patch<ApiLesson>(`/lessons/${id}`, input);
  return data;
}

export async function deleteLesson(id: string): Promise<void> {
  await api.delete(`/lessons/${id}`);
}

function contentTypeFor(file: File, kind: AssetKind): string {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();
  const byExtension: Record<string, string> = {
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    mkv: "video/x-matroska",
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zip: "application/zip",
    txt: "text/plain",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return (extension && byExtension[extension]) || (kind === "VIDEO" ? "video/mp4" : "application/octet-stream");
}

export async function initiateUpload(file: File, kind: AssetKind): Promise<UploadTicket> {
  const contentType = contentTypeFor(file, kind);
  const { data } = await api.post<UploadTicket>("/media/uploads", {
    filename: file.name,
    contentType,
    sizeBytes: file.size,
    kind,
  });
  return data;
}

export function uploadToMinio(
  ticket: UploadTicket,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(ticket.method, ticket.uploadUrl);
    Object.entries(ticket.headers).forEach(([key, value]) => request.setRequestHeader(key, value));
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded * 100) / event.total));
    };
    request.onerror = () => reject(new Error("MinIO upload failed"));
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error(`MinIO upload failed (${request.status})`));
    };
    request.send(file);
  });
}

export async function completeUpload(assetId: string): Promise<MediaAsset> {
  const { data } = await api.post<MediaAsset>(`/media/uploads/${assetId}/complete`);
  return data;
}

export async function getAsset(assetId: string): Promise<MediaAsset> {
  const { data } = await api.get<MediaAsset>(`/media/assets/${assetId}`);
  return data;
}

export async function uploadAsset(
  file: File,
  kind: AssetKind,
  onProgress?: (percent: number) => void,
): Promise<MediaAsset> {
  const ticket = await initiateUpload(file, kind);
  await uploadToMinio(ticket, file, onProgress);
  return completeUpload(ticket.assetId);
}

export async function waitForAssetReady(
  assetId: string,
  timeoutMs = 15 * 60 * 1000,
): Promise<MediaAsset> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const asset = await getAsset(assetId);
    if (asset.status === "READY") return asset;
    if (asset.status === "FAILED") throw new Error(asset.errorMessage || "Video processing failed");
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  throw new Error("Video processing timed out");
}

export async function attachMaterial(
  lessonId: string,
  input: { assetId: string; title: string; order?: number; isDownloadable?: boolean },
): Promise<LessonMaterial> {
  const { data } = await api.post<LessonMaterial>(`/lessons/${lessonId}/materials`, input);
  return data;
}

export async function getAdminQuiz(lessonId: string): Promise<QuizAdmin | null> {
  try {
    const { data } = await api.get<QuizAdmin>(`/lessons/${lessonId}/quiz/admin`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

export async function saveQuiz(lessonId: string, input: QuizInput): Promise<void> {
  await api.put(`/lessons/${lessonId}/quiz`, input);
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const { data } = await api.get<AdminDashboard>("/admin/dashboard");
  return data;
}

export async function updateAdminUser(
  userId: string,
  input: { role?: "STUDENT" | "INSTRUCTOR" | "ADMIN"; isActive?: boolean },
): Promise<AdminUser> {
  const { data } = await api.patch<AdminUser>(`/users/${userId}`, input);
  return data;
}

export async function createSection(
  courseId: string,
  input: { title: string; description?: string; order?: number },
): Promise<CourseSection> {
  const { data } = await api.post<CourseSection>(`/courses/${courseId}/sections`, input);
  return data;
}

export async function updateSection(
  courseId: string,
  sectionId: string,
  input: { title?: string; description?: string | null; order?: number },
): Promise<CourseSection> {
  const { data } = await api.patch<CourseSection>(
    `/courses/${courseId}/sections/${sectionId}`,
    input,
  );
  return data;
}

export async function deleteSection(courseId: string, sectionId: string): Promise<void> {
  await api.delete(`/courses/${courseId}/sections/${sectionId}`);
}

export async function updateMaterial(
  lessonId: string,
  materialId: string,
  input: { title?: string; order?: number; isDownloadable?: boolean },
): Promise<LessonMaterial> {
  const { data } = await api.patch<LessonMaterial>(
    `/lessons/${lessonId}/materials/${materialId}`,
    input,
  );
  return data;
}

export async function deleteMaterial(lessonId: string, materialId: string): Promise<void> {
  await api.delete(`/lessons/${lessonId}/materials/${materialId}`);
}

export async function listAdminReviews(): Promise<AdminReview[]> {
  const { data } = await api.get<AdminReview[]>("/admin/reviews");
  return data;
}

export async function moderateReview(
  reviewId: string,
  status: ReviewStatus,
): Promise<AdminReview> {
  const { data } = await api.patch<AdminReview>(`/admin/reviews/${reviewId}`, { status });
  return data;
}
