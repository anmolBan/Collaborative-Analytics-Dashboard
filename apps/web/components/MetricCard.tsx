import type { DashboardMetric } from "../app/dashboard/action";

const metricToneByKey: Record<string, string> = {
  CLICKS: "from-amber-300/20 to-amber-500/5 text-amber-200",
  ERRORS: "from-rose-300/20 to-rose-500/5 text-rose-200",
  PAGE_VIEWS: "from-sky-300/20 to-sky-500/5 text-sky-200",
  REVENUE: "from-teal-300/20 to-teal-500/5 text-teal-200",
  USERS: "from-violet-300/20 to-violet-500/5 text-violet-200",
};

function MiniChart({ samples }: { samples: DashboardMetric["samples"] }) {
  const values =
    samples.length > 0 ? samples.map((sample) => sample.value) : [4, 8, 6, 12, 10, 14];
  const max = Math.max(...values, 1);

  return (
    <div className="grid h-20 grid-cols-8 items-end gap-1.5">
      {values.slice(-8).map((value, index) => (
        <span
          className="rounded-t bg-gradient-to-b from-teal-200 to-teal-700"
          key={`${value}-${index}`}
          style={{ height: `${Math.max((value / max) * 100, 10)}%` }}
        />
      ))}
    </div>
  );
}

export default function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <article
      className={`rounded-lg border border-slate-500/15 bg-gradient-to-br ${
        metricToneByKey[metric.key] ?? "from-slate-300/10 to-slate-500/5 text-slate-200"
      } p-5`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            {metric.label}
          </p>
          <strong className="mt-3 block text-3xl">{metric.displayValue}</strong>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            metric.delta >= 0
              ? "bg-teal-300/10 text-teal-100"
              : "bg-rose-300/10 text-rose-100"
          }`}
        >
          {metric.delta >= 0 ? "+" : ""}
          {metric.delta.toFixed(1)}%
        </span>
      </div>
      <div className="mt-6">
        <MiniChart samples={metric.samples} />
      </div>
    </article>
  );
}
