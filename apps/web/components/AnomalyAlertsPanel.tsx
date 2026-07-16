import type { DashboardAlert } from "../app/dashboard/action";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type AnomalyAlertsPanelProps = {
  activeRules: number;
  alerts: DashboardAlert[];
};

export default function AnomalyAlertsPanel({
  activeRules,
  alerts,
}: AnomalyAlertsPanelProps) {
  return (
    <section className="rounded-lg border border-slate-500/15 bg-[#0d1316] p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-200">
        Anomaly alerts
      </p>

      <div className="mt-4 grid gap-3">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div className="rounded-lg bg-rose-950/20 p-4" key={alert.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-rose-100">{alert.metricLabel}</p>
                <span className="text-xs font-bold text-rose-200">
                  {alert.status}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Value {alert.value.toFixed(2)} vs mean {alert.mean.toFixed(2)}.
                Triggered {formatDate(alert.triggeredAt)}.
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-slate-950/60 p-4">
            <p className="font-bold text-slate-200">No active alerts</p>
            <p className="mt-2 text-sm text-slate-500">
              {activeRules} enabled rules are watching this team.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
