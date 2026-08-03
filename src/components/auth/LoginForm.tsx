"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  email: z.string().email("Enter a valid work email."),
  password: z.string().min(8, "Password must contain at least 8 characters."),
});
type Values = z.infer<typeof schema>;

export const LoginForm = () => {
  const [visible, setVisible] = useState(false);
  const login = useLogin();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });
  const submit = (data: Values) => {
    sessionStorage.setItem("skytech_login_attempt", JSON.stringify(data));
    login.mutate(data);
  };
  const enterDemo = () => {
    setAuth(
      {
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
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      "demo-development-access",
      "demo-development-refresh",
    );
    router.push("/home");
  };
  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@skytech.com"
            className="pl-9"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-danger">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="px-9"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute right-3 top-3 text-muted-foreground"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-danger">{errors.password.message}</p>
        )}
      </div>
      <Button className="w-full" type="submit" disabled={login.isPending}>
        {login.isPending ? "Signing in…" : "Login"}
      </Button>
      {demoEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            Development only
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={enterDemo}
          >
            Enter demo workspace
          </Button>
        </>
      )}
    </form>
  );
};
