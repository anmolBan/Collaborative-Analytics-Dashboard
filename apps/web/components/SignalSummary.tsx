import type { DashboardMetric } from "../app/dashboard/action";

type SignalSummaryProps = {
  errorMetric?: DashboardMetric;
  revenueMetric?: DashboardMetric;
  usersMetric?: DashboardMetric;
};

export default function SignalSummary({
  errorMetric,
  revenueMetric,
  usersMetric,
}: SignalSummaryProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-lg border border-slate-500/15 bg-[#0d1316] p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
          Revenue signal
        </p>
        <strong className="mt-3 block text-3xl text-teal-200">
          {revenueMetric?.displayValue ?? "N/A"}
        </strong>
      </div>
      <div className="rounded-lg border border-slate-500/15 bg-[#0d1316] p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
          Users tracked
        </p>
        <strong className="mt-3 block text-3xl text-violet-200">
          {usersMetric?.displayValue ?? "N/A"}
        </strong>
      </div>
      <div className="rounded-lg border border-slate-500/15 bg-[#0d1316] p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
          Error monitor
        </p>
        <strong className="mt-3 block text-3xl text-rose-200">
          {errorMetric?.displayValue ?? "N/A"}
        </strong>
      </div>
    </div>
  );
}
