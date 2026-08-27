import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
export const metadata: Metadata = { title: "Login" };
export default function LoginPage() {
  return (
    <main
      className="relative grid h-screen overflow-hidden bg-cover bg-center lg:grid-cols-2"
      style={{ backgroundImage: "url('/assets/loginOTP_bg.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/15" />
      <div className="relative hidden lg:block" />
      <div className="relative flex h-full items-center justify-center p-4 sm:p-8 lg:justify-start">
        <section className="flex flex-col w-full max-w-[600px] max-h-[90vh] overflow-y-auto border border-white/55 bg-white/10 p-6 text-slate-950 shadow-2xl backdrop-blur-[3px] sm:p-12">
          <div className="mb-10 text-center">
            <img
              src="/assets/skytech_Logo.png"
              alt="Skytech"
              className="mx-auto mb-6 h-12 w-12 rounded-xl shadow-lg"
            />
            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
              Welcome!
            </h1>
          </div>
          <LoginForm />
          <p className="mt-12 text-center text-sm text-white drop-shadow-sm sm:text-base">
            Internal use only. Access requires admin validation.
          </p>
        </section>
      </div>
    </main>
  );
}
