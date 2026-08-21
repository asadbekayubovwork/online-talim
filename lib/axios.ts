import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearSession,
  getAccessToken,
  refreshTokens,
} from "./auth";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

// NEXT_PUBLIC_* values are inlined at build time. If the variable is missing
// from a production build, a localhost fallback would point the live site at
// the visitor's own machine — so only development may fall back to localhost.
const fallbackApiUrl =
  process.env.NODE_ENV === "production"
    ? "https://talim-api.asadullohbek.uz/api"
    : "http://localhost:8000/api";

export const API_BASE_URL = (configuredApiUrl || fallbackApiUrl).replace(/\/+$/, "");

if (!configuredApiUrl && typeof window !== "undefined") {
  console.warn(
    `NEXT_PUBLIC_API_URL is not set; falling back to ${API_BASE_URL}. ` +
      "Set it in the Vercel project settings and redeploy.",
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function isAuthRoute(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh")
  );
}

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthRoute(original.url)
    ) {
      original._retry = true;
      refreshPromise = refreshPromise ?? refreshTokens();
      const accessToken = await refreshPromise.finally(() => {
        refreshPromise = null;
      });

      if (accessToken) {
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      }

      clearSession();
    }

    return Promise.reject(error);
  },
);

export default api;
