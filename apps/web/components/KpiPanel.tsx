import type { DashboardKpi } from "../app/dashboard/action";

export default function KpiPanel({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <section className="rounded-lg border border-slate-500/15 bg-[#0d1316] p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-200">
        KPI calculations
      </p>

      <div className="mt-4 grid gap-3">
        {kpis.length > 0 ? (
          kpis.map((kpi) => (
            <div
              className="flex items-center justify-between rounded-lg bg-slate-950/60 p-4"
              key={kpi.id}
            >
              <div>
                <p className="font-bold text-slate-100">{kpi.label}</p>
                <p className="text-xs text-slate-500">{kpi.key}</p>
              </div>
              <strong className="text-xl text-amber-200">{kpi.value}</strong>
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-slate-950/60 p-4">
            <p className="font-bold text-slate-200">No KPIs configured</p>
            <p className="mt-2 text-sm text-slate-500">
              Add KPI definitions like ARPU or Error Rate for this team.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
