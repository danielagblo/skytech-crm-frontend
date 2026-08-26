"use client";

import { useEffect } from "react";
import { usersService } from "@/services/users.service";
import { useAuthStore } from "@/store/authStore";
import { isDemoSession } from "@/lib/demo-data";

export const usePresenceHeartbeat = () => {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!authenticated || isDemoSession()) return;
    let stopped = false;
    const heartbeat = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await usersService.heartbeat();
        if (!stopped) setUser(response.data.data);
      } catch {
        // The shared API client handles authentication and network failures.
      }
    };
    void heartbeat();
    const interval = window.setInterval(() => void heartbeat(), 60_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void heartbeat();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [authenticated, setUser]);
};
