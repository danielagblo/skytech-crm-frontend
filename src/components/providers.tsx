"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import { useCurrentUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

const AuthBootstrap = () => {
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const isDemoSession = accessToken?.startsWith("demo-") ?? false;
  const currentUser = useCurrentUser(
    hydrated && isAuthenticated && !isDemoSession,
  );
  useEffect(() => {
    if (currentUser.data) setUser(currentUser.data);
  }, [currentUser.data, setUser]);
  return null;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const rehydrate = useAuthStore((state) => state.rehydrate);
  useEffect(() => rehydrate(), [rehydrate]);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthBootstrap />
        <Toaster richColors closeButton position="top-right" />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};
