import type { DashboardTeam } from "../app/dashboard/action";

type TeamAccessPanelProps = {
  activeTeamId: string;
  teams: DashboardTeam[];
};

export default function TeamAccessPanel({
  activeTeamId,
  teams,
}: TeamAccessPanelProps) {
  return (
    <aside className="h-fit rounded-lg border border-slate-500/15 bg-[#0d1316] p-4 lg:sticky lg:top-24">
      <p className="px-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
        Authorized teams
      </p>

      <div className="mt-4 grid gap-2">
        {teams.map((team) => (
          <div
            className={`rounded-lg border p-3 ${
              team.id === activeTeamId
                ? "border-teal-200/30 bg-teal-300/10"
                : "border-slate-500/10 bg-slate-950/40"
            }`}
            key={team.id}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-slate-100">{team.name}</span>
              <span className="text-xs font-bold text-teal-200">{team.role}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {team.dashboards.length} dashboards, {team.metrics.length} metrics
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-amber-200/15 bg-amber-300/10 p-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-200">
          Isolation
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Data is loaded through your team memberships only. No client-provided
          team id is trusted.
        </p>
      </div>
    </aside>
  );
}
