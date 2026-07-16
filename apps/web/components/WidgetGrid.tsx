import type {
  DashboardBoard,
  DashboardKpi,
  DashboardMetric,
} from "../app/dashboard/action";

type WidgetGridProps = {
  dashboard: DashboardBoard | null;
  kpis: DashboardKpi[];
  metrics: DashboardMetric[];
};

export default function WidgetGrid({ dashboard, kpis, metrics }: WidgetGridProps) {
  const widgets = dashboard?.widgets ?? [];

  return (
    <section className="rounded-lg border border-slate-500/15 bg-[#0d1316] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
            Dashboard layout
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-50">Widgets</h2>
        </div>
        <span className="rounded-lg bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-400">
          Revision {dashboard?.revision ?? 1}
        </span>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-12">
        {widgets.map((widget) => {
          const metric = metrics.find((item) => item.key === widget.config.metricKey);
          const kpi = kpis.find((item) => item.key === widget.config.kpiKey);

          return (
            <div
              className="rounded-lg border border-slate-500/15 bg-slate-950/60 p-4 lg:col-span-4"
              key={widget.id}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
                  {widget.type.replace("_", " ")}
                </span>
                <span className="text-xs text-slate-600">
                  {widget.width}x{widget.height}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-slate-50">
                {metric?.label ?? kpi?.label ?? "Dashboard widget"}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {metric?.displayValue ?? kpi?.value ?? "Configured"}
              </p>
            </div>
          );
        })}

        {widgets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-500/20 bg-slate-950/40 p-6 lg:col-span-12">
            <p className="font-bold text-slate-200">No widgets yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Create dashboard widgets to visualize metrics and KPIs.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
