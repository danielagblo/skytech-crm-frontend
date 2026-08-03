"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

export const useLogin = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ data }) => {
      sessionStorage.setItem("skytech_user_id", data.data.userId);
      toast.success("Password accepted. Enter the six-digit code we sent you.");
      router.push("/verify-otp");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to sign in. Check your email and password.",
        ),
      ),
  });
};

export const useVerifyOtp = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      sessionStorage.removeItem("skytech_login_attempt");
      sessionStorage.removeItem("skytech_user_id");
      toast.success(`Welcome, ${data.data.user.firstName}.`);
      router.replace("/home");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "That code is invalid or has expired. Request a new code and try again.",
        ),
      ),
  });
};

export const useCurrentUser = (enabled = true) =>
  useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.me,
    select: (response) => response.data.data,
    enabled,
    retry: false,
  });

export const useLogout = () => {
  const router = useRouter();
  const clear = useAuthStore((state) => state.clearAuth);
  const mutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clear();
      toast.success("You have been signed out safely.");
      router.replace("/login");
    },
  });
  return { logout: () => mutation.mutate(), isPending: mutation.isPending };
};
