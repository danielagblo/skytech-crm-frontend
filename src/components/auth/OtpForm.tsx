"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVerifyOtp } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-error";
import type { LoginRequest } from "@/types/auth.types";

const schema = z
  .string()
  .regex(/^\d{6}$/, "Enter the complete six-digit verification code.");

export const OtpForm = () => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const verify = useVerifyOtp();
  const resend = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: ({ data }) => {
      sessionStorage.setItem("skytech_user_id", data.data.userId);
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
      toast.success("A new six-digit code has been sent.");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "A new code could not be sent. Return to login and try again.",
        ),
      ),
  });

  const updateDigits = (value: string, index: number) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length > 1) {
      const next = [...digits];
      numbers
        .slice(0, 6 - index)
        .split("")
        .forEach((digit, offset) => {
          next[index + offset] = digit;
        });
      setDigits(next);
      refs.current[Math.min(index + numbers.length, 5)]?.focus();
      return;
    }
    setDigits((current) =>
      current.map((digit, currentIndex) =>
        currentIndex === index ? numbers : digit,
      ),
    );
    if (numbers && index < 5) refs.current[index + 1]?.focus();
  };

  const submit = () => {
    const otp = digits.join("");
    const parsed = schema.safeParse(otp);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const userId = sessionStorage.getItem("skytech_user_id");
    if (!userId) {
      toast.error(
        "Your verification session expired. Return to login to request a new code.",
      );
      return;
    }
    verify.mutate({ userId, otp });
  };

  const resendCode = () => {
    const saved = sessionStorage.getItem("skytech_login_attempt");
    if (!saved) {
      toast.error("Return to login to request a new code.");
      return;
    }
    try {
      resend.mutate(JSON.parse(saved) as LoginRequest);
    } catch {
      toast.error(
        "Your saved login attempt is invalid. Return to login and try again.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2">
        {digits.map((digit, index) => (
          <Input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            aria-label={`OTP digit ${index + 1}`}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={index === 0 ? 6 : 1}
            value={digit}
            onChange={(event) => updateDigits(event.target.value, index)}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !digits[index] && index > 0)
                refs.current[index - 1]?.focus();
            }}
            className="h-16 w-11 rounded-2xl border-slate-500/35 bg-white/25 px-0 text-center text-2xl font-semibold text-slate-950 shadow-sm focus-visible:bg-white/40 sm:w-14"
          />
        ))}
      </div>
      <p className="text-center text-sm text-slate-700">
        Did not get a code?{" "}
        <button
          type="button"
          className="font-semibold text-green-700 disabled:opacity-50"
          disabled={resend.isPending}
          onClick={resendCode}
        >
          {resend.isPending ? "Sending…" : "Resend"}
        </button>
      </p>
      <Button className="h-16 w-full rounded-2xl text-lg font-normal" onClick={submit} disabled={verify.isPending}>
        {verify.isPending ? "Verifying…" : "Verify & continue"}
      </Button>
    </div>
  );
};
