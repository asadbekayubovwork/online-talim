import axios from "axios";
import api, { API_BASE_URL } from "./axios";
import type { ApiLesson } from "./admin";

export interface PlaybackTicket {
  manifestUrl: string;
  expiresIn: number;
  assetId: string;
}

export interface PublicQuizChoice {
  id: string;
  text: string;
  order: number;
}

export interface PublicQuizQuestion {
  id: string;
  type: "SINGLE" | "MULTIPLE" | "TRUE_FALSE";
  prompt: string;
  order: number;
  points: number;
  choices: PublicQuizChoice[];
}

export interface PublicQuiz {
  id: string;
  title: string;
  passingScore: number;
  maxAttempts?: number | null;
  attemptsUsed: number;
  questions: PublicQuizQuestion[];
}

export interface QuizResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  nextLessonUnlocked: boolean;
}

function absoluteApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window === "undefined") return path;
  const apiBase = new URL(API_BASE_URL, window.location.origin);
  return new URL(path, apiBase.origin).toString();
}

export async function getLearningLesson(lessonId: string): Promise<ApiLesson> {
  const { data } = await api.get<ApiLesson>(`/lessons/${lessonId}`);
  return data;
}

export async function getPlayback(lessonId: string): Promise<PlaybackTicket> {
  const { data } = await api.post<PlaybackTicket>(`/media/lessons/${lessonId}/playback`);
  return { ...data, manifestUrl: absoluteApiUrl(data.manifestUrl) };
}

export async function getQuiz(lessonId: string): Promise<PublicQuiz | null> {
  try {
    const { data } = await api.get<PublicQuiz>(`/lessons/${lessonId}/quiz`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

export async function submitQuiz(
  lessonId: string,
  answers: Record<string, string[]>,
): Promise<QuizResult> {
  const { data } = await api.post<QuizResult>(`/lessons/${lessonId}/quiz/submit`, { answers });
  return data;
}

export async function saveProtectedProgress(
  lessonId: string,
  input: { watchedSeconds?: number; completed?: boolean },
): Promise<void> {
  await api.post(`/lessons/${lessonId}/progress`, input);
}

export async function downloadMaterial(
  materialId: string,
  filename: string,
  inline = false,
): Promise<void> {
  const { data } = await api.get<Blob>(`/media/materials/${materialId}/content`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  if (inline) {
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
