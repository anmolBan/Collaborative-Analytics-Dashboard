import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import AnomalyAlertsPanel from "../../components/AnomalyAlertsPanel";
import DashboardHeader from "../../components/DashboardHeader";
import KpiPanel from "../../components/KpiPanel";
import MetricCard from "../../components/MetricCard";
import SignalSummary from "../../components/SignalSummary";
import TeamAccessPanel from "../../components/TeamAccessPanel";
import WidgetGrid from "../../components/WidgetGrid";
import { authOptions } from "../../lib/authOptions";
import getDashboardData from "./action";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const dashboardData = await getDashboardData(session.user.id);
  const team = dashboardData.primaryTeam;

  if (!team) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#070a0d] px-5 text-slate-100">
        <section className="max-w-xl rounded-lg border border-slate-500/15 bg-[#0d1316] p-8 text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-200">
            No team access
          </p>
          <h1 className="mt-4 text-4xl font-black text-slate-50">
            You are not assigned to a team yet.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Dashboard data is scoped through team membership. Ask an admin to
            add you before analytics are shown.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-teal-300 px-5 text-sm font-extrabold text-[#041010]"
          >
            Back home
          </Link>
        </section>
      </main>
    );
  }

  const activeDashboard = team.dashboards[0] ?? null;
  const revenueMetric = team.metrics.find((metric) => metric.key === "REVENUE");
  const usersMetric = team.metrics.find((metric) => metric.key === "USERS");
  const errorMetric = team.metrics.find((metric) => metric.key === "ERRORS");

  return (
    <main className="min-h-screen bg-[#070a0d] text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:64px_64px]" />

      <DashboardHeader
        organizationName={team.organization.name}
        role={team.role}
        user={{
          email: session.user.email,
          name: session.user.name,
        }}
      />

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[260px_1fr]">
        <TeamAccessPanel activeTeamId={team.id} teams={dashboardData.teams} />

        <section className="grid gap-6">
          <div className="rounded-lg border border-slate-500/15 bg-[#0d1316] p-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-200">
                  {team.organization.name} / {team.name}
                </p>
                <h1 className="mt-4 text-4xl font-black leading-tight text-slate-50 sm:text-6xl">
                  {activeDashboard?.name ?? `${team.name} Dashboard`}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                  Live metrics, KPI snapshots, dashboard widgets, and anomaly
                  alerts scoped to your team membership.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-500/15 bg-slate-950/60 p-3">
                <div>
                  <p className="text-xs text-slate-500">Teams</p>
                  <strong className="mt-2 block text-2xl text-slate-50">
                    {dashboardData.summary.teamCount}
                  </strong>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Boards</p>
                  <strong className="mt-2 block text-2xl text-slate-50">
                    {dashboardData.summary.dashboardCount}
                  </strong>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Alerts</p>
                  <strong className="mt-2 block text-2xl text-slate-50">
                    {dashboardData.summary.alertCount}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {team.metrics.slice(0, 4).map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <WidgetGrid
              activeRules={team.activeRules}
              alerts={team.alerts}
              dashboard={activeDashboard}
              kpis={team.kpis}
              metrics={team.metrics}
              role={team.role}
            />

            <section className="grid gap-6">
              <KpiPanel kpis={team.kpis} />
              <AnomalyAlertsPanel
                activeRules={team.activeRules}
                alerts={team.alerts}
              />
            </section>
          </div>

          <SignalSummary
            errorMetric={errorMetric}
            revenueMetric={revenueMetric}
            usersMetric={usersMetric}
          />
        </section>
      </div>
    </main>
  );
}
