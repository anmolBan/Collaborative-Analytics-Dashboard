"use client";

import Link from "next/link";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthPageProps = {
  signIn: boolean;
};

const demoRows = [
  { label: "Finance", value: "$84.2k", toneClass: "text-teal-200" },
  { label: "Errors", value: "18", toneClass: "text-rose-300" },
  { label: "ARPU", value: "$63.79", toneClass: "text-amber-300" },
] as const;

const chartBars = ["h-[42%]", "h-[64%]", "h-[50%]", "h-[82%]", "h-[70%]"];

export default function AuthPage({ signIn }: AuthPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = signIn ? "Welcome back" : "Create your workspace";
  const eyebrow = signIn ? "Sign in" : "Get started";
  const submitLabel = signIn ? "Sign in" : "Create account";
  const alternateHref = signIn ? "/signup" : "/signin";
  const alternateLabel = signIn
    ? "Need an account? Sign up"
    : "Already have an account? Sign in";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!signIn) {
      setError("Account creation is not connected yet.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);

    const result = await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(result.url ?? "/");
    router.refresh();
  }

  return (
    <main className="grid min-h-svh place-items-center bg-[#070a0d] bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(135deg,#070a0d_0%,#101616_48%,#090b10_100%)] bg-[length:56px_56px,56px_56px,auto] p-4 text-slate-100 sm:p-8">
      <section
        className="grid min-h-[min(720px,calc(100svh-64px))] w-full max-w-6xl overflow-hidden rounded-lg border border-slate-400/20 bg-[#0c1114]/95 shadow-[0_28px_100px_rgba(0,0,0,0.48)] lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]"
        aria-label={title}
      >
        <div className="relative flex min-h-[460px] flex-col justify-between overflow-hidden bg-[linear-gradient(140deg,rgba(7,11,14,0.98),rgba(13,37,37,0.94)),url('/globe.svg')] p-6 text-white sm:p-9">
          <div className="absolute inset-x-[18%] bottom-[-24%] h-[52%] -rotate-[8deg] bg-[linear-gradient(120deg,rgba(20,184,166,0.18),rgba(245,158,11,0.10))]" />

          <Link
            href="/"
            className="relative z-10 inline-flex w-fit items-center gap-3 text-sm font-bold text-white"
            aria-label="Collaborative Analytics Dashboard home"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-200/30 bg-teal-400/15 text-xs tracking-[0.04em]">
              CA
            </span>
            <span>Collaborative Analytics</span>
          </Link>

          <div className="relative z-10 my-14 max-w-xl sm:my-18">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-teal-200">
              Live team intelligence
            </p>
            <h1 className="max-w-2xl text-[clamp(2.5rem,5vw,4.25rem)] font-extrabold leading-[0.96]">
              Keep every team inside its own data lane.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-200/75 sm:text-[17px]">
              Secure dashboards, role-aware editing, real-time metrics, and
              collaboration built for multi-tenant analytics.
            </p>
          </div>

          <div
            className="relative z-10 w-full max-w-[480px] rounded-lg border border-slate-400/20 bg-black/45 p-4 backdrop-blur-xl"
            aria-hidden="true"
          >
            <div className="flex items-center justify-between gap-4 text-sm font-bold text-slate-100/85">
              <span>Finance overview</span>
              <span className="rounded-full bg-teal-300/15 px-2.5 py-1 text-xs text-teal-100">
                Live
              </span>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {demoRows.map((row) => (
                <div
                  className="min-w-0 rounded-lg border border-slate-400/10 bg-slate-950/60 p-3.5"
                  key={row.label}
                >
                  <span className="block text-[13px] leading-5 text-slate-200/60">
                    {row.label}
                  </span>
                  <strong className={`mt-2 block text-[22px] ${row.toneClass}`}>
                    {row.value}
                  </strong>
                </div>
              ))}
            </div>

            <div className="mt-4 grid h-30 grid-cols-5 items-end gap-2 rounded-lg border border-slate-400/10 bg-black/50 p-3.5">
              {chartBars.map((heightClass) => (
                <span
                  className={`${heightClass} block rounded-t-md bg-gradient-to-b from-teal-200 to-teal-700`}
                  key={heightClass}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center border-l border-slate-400/15 bg-[linear-gradient(180deg,#11181c_0%,#0c1115_100%)] p-7 sm:p-10 lg:p-14">
          <div className="mb-8">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-teal-300">
              {eyebrow}
            </p>
            <h2 className="mb-3 text-[clamp(1.875rem,4vw,2.75rem)] font-extrabold leading-[1.05] text-slate-50">
              {title}
            </h2>
            <span className="block text-[13px] leading-5 text-slate-400">
              {signIn
                ? "Access dashboards, alerts, and collaboration sessions."
                : "Set up an organization, invite your team, and start tracking metrics."}
            </span>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            {!signIn && (
              <>
                <label className="grid gap-2">
                  <span className="text-[13px] font-bold leading-5 text-slate-200">
                    Full name
                  </span>
                  <input
                    className="h-[50px] w-full rounded-lg border border-slate-400/25 bg-[#080d10] px-3.5 font-inherit text-slate-50 outline-none transition focus:border-teal-300 focus:bg-[#0b1215] focus:shadow-[0_0_0_4px_rgba(45,212,191,0.13)] placeholder:text-slate-500"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Morgan"
                    required={!signIn}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-[13px] font-bold leading-5 text-slate-200">
                    Organization
                  </span>
                  <input
                    className="h-[50px] w-full rounded-lg border border-slate-400/25 bg-[#080d10] px-3.5 font-inherit text-slate-50 outline-none transition focus:border-teal-300 focus:bg-[#0b1215] focus:shadow-[0_0_0_4px_rgba(45,212,191,0.13)] placeholder:text-slate-500"
                    name="organization"
                    type="text"
                    autoComplete="organization"
                    placeholder="Northstar Analytics"
                    required={!signIn}
                  />
                </label>
              </>
            )}

            <label className="grid gap-2">
              <span className="text-[13px] font-bold leading-5 text-slate-200">
                Email
              </span>
              <input
                className="h-[50px] w-full rounded-lg border border-slate-400/25 bg-[#080d10] px-3.5 font-inherit text-slate-50 outline-none transition focus:border-teal-300 focus:bg-[#0b1215] focus:shadow-[0_0_0_4px_rgba(45,212,191,0.13)] placeholder:text-slate-500"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[13px] font-bold leading-5 text-slate-200">
                Password
              </span>
              <input
                className="h-[50px] w-full rounded-lg border border-slate-400/25 bg-[#080d10] px-3.5 font-inherit text-slate-50 outline-none transition focus:border-teal-300 focus:bg-[#0b1215] focus:shadow-[0_0_0_4px_rgba(45,212,191,0.13)] placeholder:text-slate-500"
                name="password"
                type="password"
                autoComplete={signIn ? "current-password" : "new-password"}
                placeholder="Enter your password"
                required
              />
            </label>

            {signIn ? (
              <div className="my-1 flex flex-col gap-2.5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2">
                  <input
                    className="h-4 w-4 accent-teal-300"
                    type="checkbox"
                    name="remember"
                  />
                  <span>Remember me</span>
                </label>
                <Link className="font-bold text-teal-200" href="/forgot-password">
                  Forgot password?
                </Link>
              </div>
            ) : (
              <p className="m-0 text-[13px] leading-5 text-slate-400">
                By continuing, you agree to secure tenant-scoped access for
                every workspace member.
              </p>
            )}

            {error ? (
              <p className="rounded-lg border border-rose-400/25 bg-rose-950/30 px-3.5 py-3 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <button
              className="h-[52px] cursor-pointer rounded-lg border-0 bg-teal-300 font-extrabold text-[#041010] transition hover:-translate-y-px hover:bg-amber-500 hover:shadow-[0_14px_32px_rgba(245,158,11,0.2)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-teal-300 disabled:hover:shadow-none"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : submitLabel}
            </button>
          </form>

          <div className="mt-7 flex justify-center text-sm text-slate-400">
            <Link className="font-bold text-teal-200" href={alternateHref}>
              {alternateLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
