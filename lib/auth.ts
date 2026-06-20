// Auth layer for the NestJS backend (Swagger: http://localhost:4791/docs).
//
// Endpoints (base = NEXT_PUBLIC_API_URL, e.g. http://localhost:4791/api):
//   POST /auth/register  -> { accessToken, refreshToken, user }
//   POST /auth/login     -> { accessToken, refreshToken, user }
//   POST /auth/refresh   -> { accessToken, refreshToken, user }   body: { refreshToken }
//   POST /auth/logout    -> { success: true }                     (bearer)
//   GET  /users/me       -> full user                             (bearer)

import axios, { AxiosError } from "axios";
import api, { API_BASE_URL } from "./axios";

export type Role = "STUDENT" | "TEACHER" | "ADMIN" | string;

// Minimal user returned by login/register; /users/me returns the extended set.
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
  user: AuthUser;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  nationality: string;
  // Optional
  city?: string;
  country?: string;
  phone?: string;
  universityId?: string;
  whatsapp?: string;
}

// ── Token / session storage (localStorage) ──────────────────────────────────
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "authUser";

const isBrowser = () => typeof window !== "undefined";

export function getAccessToken(): string | null {
  return isBrowser() ? localStorage.getItem(ACCESS_KEY) : null;
}

export function getRefreshToken(): string | null {
  return isBrowser() ? localStorage.getItem(REFRESH_KEY) : null;
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(res: AuthResponse): void {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_KEY, res.accessToken);
  localStorage.setItem(REFRESH_KEY, res.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(res.user));
}

export function updateTokens(accessToken: string, refreshToken: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function setStoredUser(user: AuthUser): void {
  if (!isBrowser()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── API calls ───────────────────────────────────────────────────────────────
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
    // Best-effort server-side logout; never block local sign-out on it.
    await api.post("/auth/logout");
  } catch {
    // ignore network/401 — we clear locally regardless
  } finally {
    clearSession();
  }
}

/**
 * Exchange the stored refresh token for a fresh token pair. Uses a bare axios
 * client (not the intercepted `api`) so a 401 here cannot trigger the refresh
 * interceptor recursively. Returns the new access token, or null on failure.
 */
export async function refreshTokens(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<AuthResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    updateTokens(data.accessToken, data.refreshToken);
    if (data.user) setStoredUser(data.user);
    return data.accessToken;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Pull a human-readable message out of an API error. The backend returns
 * `{ message: string | string[], error, statusCode }`. Falls back to the
 * provided default.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const ax = err as AxiosError<{ message?: string | string[] }>;
  const msg = ax?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string" && msg.trim()) return msg;
  return fallback;
}
