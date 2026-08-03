import type { Metadata } from 'next';
import { OtpForm } from '@/components/auth/OtpForm';

export const metadata: Metadata = { title: 'Verify OTP' };

export default function OtpPage() {
  return <main className="relative flex min-h-screen items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: "url('/assets/loginOTP_bg.png')" }}>
    <div className="absolute inset-0 bg-black/15" />
    <section className="relative w-full max-w-md rounded-2xl border border-white/50 bg-white/75 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-8 text-center">
        <img src="/assets/skytech_Logo.png" alt="Skytech" className="mx-auto mb-4 h-12 w-12 rounded-xl" />
        <p className="eyebrow text-gray-600">Identity check</p>
        <h1 className="mt-2 text-2xl font-semibold">Verify OTP</h1>
        <p className="mt-2 text-sm text-gray-600">Enter the six-digit code sent to your work email or phone.</p>
      </div>
      <OtpForm />
    </section>
  </main>;
}
