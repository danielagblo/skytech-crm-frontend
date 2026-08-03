"use client";

import { create } from "zustand";
import type { User } from "@/types/user.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  rehydrate: () => void;
}

const read = (key: string) =>
  typeof window === "undefined" ? null : localStorage.getItem(key);
const cookieOptions = () =>
  `Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
const persistAccess = (accessToken: string) => {
  localStorage.setItem("skytech_access", accessToken);
  document.cookie = `skytech_access=${encodeURIComponent(accessToken)}; ${cookieOptions()}`;
};
const clearPersisted = () => {
  localStorage.removeItem("skytech_access");
  localStorage.removeItem("skytech_refresh");
  document.cookie = `skytech_access=; ${cookieOptions()}; Max-Age=0`;
};
const isTokenValid = (token: string | null) => {
  if (!token) return false;
  if (token.startsWith("demo-"))
    return process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";
  try {
    const segment = token.split(".")[1];
    if (!segment) return false;
    const payload = JSON.parse(
      atob(segment.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  hydrated: false,
  setAuth: (user, accessToken, refreshToken) => {
    persistAccess(accessToken);
    localStorage.setItem("skytech_refresh", refreshToken);
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      hydrated: true,
    });
  },
  setAccessToken: (accessToken) => {
    persistAccess(accessToken);
    set({ accessToken, isAuthenticated: true });
  },
  setUser: (user) => set({ user }),
  clearAuth: () => {
    if (typeof window !== "undefined") clearPersisted();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hydrated: true,
    });
  },
  rehydrate: () => {
    const accessToken = read("skytech_access");
    const refreshToken = read("skytech_refresh");
    if (!isTokenValid(accessToken)) {
      clearPersisted();
      set({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        hydrated: true,
      });
      return;
    }
    set({
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken || refreshToken),
      hydrated: true,
    });
  },
}));
