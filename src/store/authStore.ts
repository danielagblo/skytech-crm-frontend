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

export const demoUser: User = {
  id: "demo-admin",
  companyId: "demo-company",
  firstName: "Jeffrey",
  lastName: "Henadez",
  email: "demo@skytech.local",
  role: "ADMIN",
  phone: "+233 55 289 2433",
  username: "demo.admin",
  planTier: "PRO",
  profilePhotoUrl: "/assets/profile_Placeholder.png",
  active: true,
  lastLogin: new Date(0).toISOString(),
  createdAt: new Date(0).toISOString(),
};

const read = (key: string) =>
  typeof window === "undefined" ? null : localStorage.getItem(key);
const cookieOptions = () =>
  `Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
const persistCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions()}`;
};
const persistAccess = (accessToken: string) => {
  localStorage.setItem("skytech_access", accessToken);
  persistCookie("skytech_access", accessToken);
};
const persistRefresh = (refreshToken: string) => {
  localStorage.setItem("skytech_refresh", refreshToken);
  persistCookie("skytech_refresh", refreshToken);
};
const clearPersisted = () => {
  localStorage.removeItem("skytech_access");
  localStorage.removeItem("skytech_refresh");
  document.cookie = `skytech_access=; ${cookieOptions()}; Max-Age=0`;
  document.cookie = `skytech_refresh=; ${cookieOptions()}; Max-Age=0`;
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
    persistRefresh(refreshToken);
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
    const accessValid = isTokenValid(accessToken);
    const refreshValid = isTokenValid(refreshToken);
    if (!accessValid && !refreshValid) {
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
      user:
        accessToken?.startsWith("demo-") &&
        process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true"
          ? demoUser
          : null,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken || refreshToken),
      hydrated: true,
    });
  },
}));
