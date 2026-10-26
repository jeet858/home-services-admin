import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#5B3FD6] via-[#4A2FBD] to-[#3204A7] p-10 text-white lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 size-[28rem] rounded-full bg-white/10 blur-3xl"
        />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 size-[26rem] rounded-full bg-[#FFB800]/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark.png" alt="" className="size-8" />
          </span>
          <span className="font-heading text-xl font-semibold">Subidha</span>
        </div>
        <div className="relative mt-auto max-w-md space-y-4">
          <h1 className="font-heading text-4xl leading-tight font-semibold text-balance">
            Every booking, professional and offer — in one place.
          </h1>
          <p className="text-white/75">
            Assign jobs, verify professionals, keep the catalogue fresh and moderate reviews for the Subidha app.
          </p>
        </div>
        <p className="relative mt-12 text-xs text-white/60">A SR Enterprise product · Restricted to authorised staff</p>
      </aside>
      <main className="flex items-center justify-center p-6 pt-safe sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="Subidha" className="h-14 w-auto rounded-lg bg-white px-2 py-1 lg:hidden" />
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in with your admin email and password.</p>
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
