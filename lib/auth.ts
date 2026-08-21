// Authentication client for the FastAPI backend.
import axios, { AxiosError } from "axios";
import api, { API_BASE_URL } from "./axios";

export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface AuthUser {
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
  universityId?: string | null;
  whatsapp?: string | null;
  nationality?: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt?: string;
  user: AuthUser;
}

export interface LoginPayload {
  /** FastAPI accepts either a username or an email in this field. */
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number;
  nationality?: string;
  city?: string;
  country?: string;
  phone?: string;
  universityId?: string;
  whatsapp?: string;
}

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "authUser";
export const AUTH_CLEARED_EVENT = "online-talim:auth-cleared";
const isBrowser = () => typeof window !== "undefined";

export function getAccessToken(): string | null {
  return isBrowser() ? sessionStorage.getItem(ACCESS_KEY) : null;
}

export function getRefreshToken(): string | null {
  return isBrowser() ? localStorage.getItem(REFRESH_KEY) : null;
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(res: AuthResponse): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(ACCESS_KEY, res.accessToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(res.user));
  localStorage.setItem(REFRESH_KEY, res.refreshToken);
}

export function updateTokens(accessToken: string, refreshToken: string): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function setStoredUser(user: AuthUser): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_KEY);
  window.dispatchEvent(new Event(AUTH_CLEARED_EVENT));
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  setSession(data);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  setSession(data);
  return data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/users/me");
  setStoredUser(data);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // Local sign-out must remain available during network failures.
  } finally {
    clearSession();
  }
}

export async function refreshTokens(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    updateTokens(data.accessToken, data.refreshToken);
    if (data.user) setStoredUser(data.user);
    return data.accessToken;
  } catch {
    clearSession();
    return null;
  }
}

type FastApiDetail =
  | string
  | Array<{ msg?: string; message?: string } | string>
  | { message?: string; extra?: unknown };

function detailMessage(detail: FastApiDetail | undefined): string | null {
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (typeof item === "string" ? item : item.msg || item.message || ""))
      .filter(Boolean);
    return messages.length ? messages.join(", ") : null;
  }
  if (detail && typeof detail === "object" && typeof detail.message === "string") {
    return detail.message;
  }
  return null;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  const response = (err as AxiosError<{
    detail?: FastApiDetail;
    message?: string | string[];
  }>)?.response?.data;
  const fastApi = detailMessage(response?.detail);
  if (fastApi) return fastApi;
  if (Array.isArray(response?.message)) return response.message.join(", ");
  if (typeof response?.message === "string" && response.message.trim()) return response.message;
  return fallback;
}

export async function updateProfile(
  input: Partial<Pick<AuthUser, "firstName" | "lastName" | "avatarUrl" | "city" | "country" | "phone" | "universityId" | "whatsapp" | "nationality">>,
): Promise<AuthUser> {
  const { data } = await api.patch<AuthUser>("/users/me/profile", input);
  setStoredUser(data);
  return data;
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await api.post("/auth/change-password", input);
  clearSession();
}
