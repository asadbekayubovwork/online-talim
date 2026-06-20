import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  getAccessToken,
  refreshTokens,
  clearSession,
} from "./auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://asadullohbek.uz/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints must never trigger the refresh-and-retry flow (a 401 from
// login/refresh is a real failure, not an expired session).
function isAuthRoute(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh")
  );
}

// Single-flight refresh: concurrent 401s share one refresh request.
let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthRoute(original.url)
    ) {
      original._retry = true;

      refreshPromise = refreshPromise ?? refreshTokens();
      const newToken = await refreshPromise.finally(() => {
        refreshPromise = null;
      });

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      // Refresh failed — session is dead.
      clearSession();
    }

    return Promise.reject(error);
  }
);

export default api;
