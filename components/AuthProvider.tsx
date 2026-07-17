"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as auth from "@/lib/auth";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCleared = () => setUser(null);
    window.addEventListener(auth.AUTH_CLEARED_EVENT, handleCleared);
    return () => window.removeEventListener(auth.AUTH_CLEARED_EVENT, handleCleared);
  }, []);

  useEffect(() => {
    let active = true;
    const cached = auth.getStoredUser();
    if (cached) setUser(cached);

    async function restoreSession() {
      try {
        let accessToken = auth.getAccessToken();
        if (!accessToken && auth.getRefreshToken()) {
          accessToken = await auth.refreshTokens();
        }
        if (!accessToken) {
          if (active) setUser(null);
          return;
        }
        const current = await auth.getMe();
        if (active) setUser(current);
      } catch {
        auth.clearSession();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await auth.login(payload);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await auth.register(payload);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const current = await auth.getMe();
    setUser(current);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
