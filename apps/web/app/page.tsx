import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../lib/authOptions";

const metrics = [
  { label: "Revenue", value: "$84.2k", delta: "+12.8%", color: "text-teal-200" },
  { label: "Page views", value: "12.4k", delta: "+8.1%", color: "text-amber-200" },
  { label: "Errors", value: "18", delta: "-4.3%", color: "text-rose-200" },
] as const;

const teams = [
  { name: "Finance", role: "Admin", status: "Editing revenue board" },
  { name: "Marketing", role: "Viewer", status: "Watching campaign metrics" },
  { name: "Platform", role: "Editor", status: "Tuning error alerts" },
] as const;

const capabilities = [
  {
    title: "Tenant-safe analytics",
    copy: "Organizations, teams, roles, and database isolation stay aligned from the first dashboard query.",
  },
  {
    title: "Live collaboration",
    copy: "Editors can shape dashboards together while viewers stay protected in read-only mode.",
  },
  {
    title: "Signals that matter",
    copy: "KPIs and anomaly alerts turn raw metrics into decisions before the trend gets noisy.",
  },
] as const;

const workflow = [
  "Create a team workspace",
  "Add dashboards and widgets",
  "Watch live metrics update",
  "Collaborate with role-aware controls",
] as const;

function DashboardScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:64px_64px]" />
      <div className="absolute right-[-180px] top-24 hidden h-[620px] w-[860px] rotate-[-7deg] rounded-lg border border-slate-500/20 bg-[#0b1114]/90 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur md:block xl:right-[-80px]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
              Finance overview
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-50">
              Team performance
            </h2>
          </div>
          <div className="rounded-full border border-teal-200/20 bg-teal-300/10 px-3 py-1 text-xs font-bold text-teal-100">
            Live sync
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <div
              className="rounded-lg border border-slate-500/15 bg-slate-950/70 p-4"
              key={metric.label}
            >
              <span className="text-xs text-slate-400">{metric.label}</span>
              <strong className={`mt-3 block text-3xl ${metric.color}`}>
                {metric.value}
              </strong>
              <span className="mt-2 block text-xs text-slate-500">
                {metric.delta} vs last hour
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[1.35fr_0.65fr] gap-3">
          <div className="rounded-lg border border-slate-500/15 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200">
                Revenue / Users
              </span>
              <span className="text-xs text-amber-200">ARPU $63.79</span>
            </div>
            <div className="mt-6 grid h-56 grid-cols-12 items-end gap-2">
              {[
                "h-[36%]",
                "h-[52%]",
                "h-[46%]",
                "h-[62%]",
                "h-[58%]",
                "h-[74%]",
                "h-[68%]",
                "h-[82%]",
                "h-[72%]",
                "h-[88%]",
                "h-[79%]",
                "h-[92%]",
              ].map((height, index) => (
                <span
                  className={`${height} rounded-t-md bg-gradient-to-b from-teal-200 to-teal-700`}
                  key={`${height}-${index}`}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-lg border border-rose-300/20 bg-rose-950/20 p-4">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-rose-200">
                Anomaly
              </span>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Errors crossed the 2 sigma threshold for Platform.
              </p>
            </div>
            <div className="rounded-lg border border-slate-500/15 bg-slate-950/70 p-4">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Active editors
              </span>
              <div className="mt-4 grid gap-3">
                {teams.map((team) => (
                  <div className="flex items-center gap-3" key={team.name}>
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-800 text-xs font-bold text-slate-200">
                      {team.name.slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-200">
                        {team.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {team.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-8 rounded-lg border border-slate-500/15 bg-[#0b1114]/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)] md:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">
            Live dashboard
          </span>
          <span className="rounded-full bg-teal-300/10 px-2 py-1 text-xs text-teal-100">
            Synced
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {metrics.map((metric) => (
            <div className="rounded-lg bg-slate-950/80 p-3" key={metric.label}>
              <span className="block truncate text-[11px] text-slate-500">
                {metric.label}
              </span>
              <strong className={`mt-2 block text-lg ${metric.color}`}>
                {metric.value}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  console.log(session);
  const isLoggedIn = Boolean(session);

  return (
    <main className="min-h-screen bg-[#070a0d] text-slate-100">
      <section className="relative min-h-[88svh] overflow-hidden border-b border-slate-500/15">
        <DashboardScene />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#070a0d_0%,rgba(7,10,13,0.92)_40%,rgba(7,10,13,0.36)_100%)]" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-200/30 bg-teal-400/15 text-xs font-extrabold tracking-[0.04em] text-teal-100">
              CA
            </span>
            <span className="text-sm font-extrabold text-slate-50 sm:text-base">
              Collaborative Analytics
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex">
            <a href="#platform">Platform</a>
            <a href="#workflow">Workflow</a>
            <a href="#security">Security</a>
          </nav>

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-teal-300 px-4 py-2.5 text-sm font-extrabold text-[#041010] transition hover:bg-amber-400"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="hidden text-sm font-bold text-slate-300 transition hover:text-white sm:inline"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-teal-300 px-4 py-2.5 text-sm font-extrabold text-[#041010] transition hover:bg-amber-400"
              >
                Start
              </Link>
            </div>
          )}
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(88svh-82px)] max-w-7xl items-center px-5 pb-40 pt-16 sm:px-8 md:pb-20">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-teal-200">
              Hierarchical analytics for fast-moving teams
            </p>
            <h1 className="max-w-4xl text-[clamp(3rem,8vw,6.8rem)] font-black leading-[0.9] text-slate-50">
              Collaborative Analytics Dashboard
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Give every organization and team a real-time dashboard that keeps
              data isolated, roles enforced, and decisions moving together.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-teal-300 px-6 text-sm font-extrabold text-[#041010] transition hover:-translate-y-px hover:bg-amber-400"
              >
                Create workspace
              </Link>
              <Link
                href="/signin"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-400/20 bg-slate-950/50 px-6 text-sm font-extrabold text-slate-100 transition hover:-translate-y-px hover:border-teal-200/40 hover:text-teal-100"
              >
                Open demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="platform"
        className="mx-auto grid max-w-7xl gap-5 px-5 py-16 sm:px-8 lg:grid-cols-3"
      >
        {capabilities.map((item) => (
          <article
            className="rounded-lg border border-slate-500/15 bg-[#0d1316] p-6"
            key={item.title}
          >
            <h2 className="text-xl font-extrabold text-slate-50">{item.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">{item.copy}</p>
          </article>
        ))}
      </section>

      <section
        id="workflow"
        className="border-y border-slate-500/15 bg-[#0a0f12] py-16"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-200">
              From setup to signal
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-slate-50 sm:text-5xl">
              Built around the way dashboard work actually happens.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-400">
              The product flow mirrors the assessment: tenant hierarchy, role
              enforcement, persistent dashboards, live collaboration, KPIs, and
              anomaly alerts.
            </p>
          </div>

          <div className="grid gap-3">
            {workflow.map((step, index) => (
              <div
                className="flex items-center gap-4 rounded-lg border border-slate-500/15 bg-slate-950/60 p-4"
                key={step}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal-300 text-sm font-black text-[#041010]">
                  {index + 1}
                </span>
                <span className="font-bold text-slate-100">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="security"
        className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1fr]"
      >
        <div className="rounded-lg border border-slate-500/15 bg-[#0d1316] p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-200">
            Role matrix
          </p>
          <div className="mt-6 grid gap-3">
            {teams.map((team) => (
              <div
                className="grid gap-2 rounded-lg bg-slate-950/60 p-4 sm:grid-cols-[120px_90px_1fr] sm:items-center"
                key={team.name}
              >
                <span className="font-extrabold text-slate-50">{team.name}</span>
                <span className="text-sm font-bold text-teal-200">{team.role}</span>
                <span className="text-sm text-slate-400">{team.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h2 className="text-4xl font-black leading-tight text-slate-50 sm:text-5xl">
            Isolation first, collaboration second, confidence always.
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-400">
            The architecture is ready for Postgres-backed tenancy, credential
            auth, WebSocket collaboration, and future Tier 3 expansion without
            forcing project hierarchy on day one.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-slate-50 px-6 text-sm font-extrabold text-slate-950 transition hover:bg-teal-200"
            >
              Build your workspace
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
