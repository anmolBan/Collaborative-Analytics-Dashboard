import prisma from "@repo/db";

export type DashboardMetric = {
  id: string;
  key: string;
  label: string;
  unit: string | null;
  value: number;
  displayValue: string;
  delta: number;
  samples: {
    id: string;
    timestamp: string;
    value: number;
  }[];
};

export type DashboardKpi = {
  id: string;
  key: string;
  label: string;
  value: string;
};

export type DashboardWidget = {
  id: string;
  type: string;
  position: number;
  x: number;
  y: number;
  width: number;
  height: number;
  config: {
    metricKey?: string;
    kpiKey?: string;
  };
};

export type DashboardBoard = {
  id: string;
  name: string;
  slug: string;
  revision: number;
  updatedAt: string;
  widgets: DashboardWidget[];
};

export type DashboardAlert = {
  id: string;
  metricLabel: string;
  status: string;
  value: number;
  mean: number;
  stddev: number;
  triggeredAt: string;
};

export type DashboardTeam = {
  id: string;
  name: string;
  slug: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  dashboards: DashboardBoard[];
  metrics: DashboardMetric[];
  kpis: DashboardKpi[];
  alerts: DashboardAlert[];
  activeRules: number;
};

export type DashboardData = {
  teams: DashboardTeam[];
  primaryTeam: DashboardTeam | null;
  summary: {
    teamCount: number;
    dashboardCount: number;
    metricCount: number;
    alertCount: number;
  };
};

type WidgetConfig = DashboardWidget["config"];

function readWidgetConfig(config: unknown): WidgetConfig {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return {};
  }

  const value = config as Record<string, unknown>;

  return {
    metricKey: typeof value.metricKey === "string" ? value.metricKey : undefined,
    kpiKey: typeof value.kpiKey === "string" ? value.kpiKey : undefined,
  };
}

function formatMetricValue(value: number, unit: string | null) {
  if (unit === "usd") {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      maximumFractionDigits: 0,
      style: "currency",
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function formatKpiValue(key: string, metrics: Record<string, number>) {
  if (key === "ARPU") {
    const revenue = metrics.REVENUE ?? 0;
    const users = metrics.USERS ?? 0;
    const arpu = users > 0 ? revenue / users : 0;

    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      maximumFractionDigits: 2,
      style: "currency",
    }).format(arpu);
  }

  if (key === "ERROR_RATE") {
    const errors = metrics.ERRORS ?? 0;
    const pageViews = metrics.PAGE_VIEWS ?? 0;
    const errorRate = pageViews > 0 ? (errors / pageViews) * 100 : 0;

    return `${errorRate.toFixed(2)}%`;
  }

  return "N/A";
}

export default async function getDashboardData(
  userId: string,
): Promise<DashboardData> {
  const memberships = await prisma.teamMembership.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      team: {
        include: {
          organization: true,
          dashboards: {
            orderBy: {
              updatedAt: "desc",
            },
            include: {
              widgets: {
                orderBy: {
                  position: "asc",
                },
              },
            },
          },
          metrics: {
            orderBy: {
              key: "asc",
            },
            include: {
              samples: {
                orderBy: {
                  timestamp: "desc",
                },
                take: 8,
              },
            },
          },
          kpis: {
            orderBy: {
              key: "asc",
            },
          },
          anomalyAlerts: {
            orderBy: {
              triggeredAt: "desc",
            },
            take: 6,
            include: {
              metric: true,
            },
          },
          anomalyRules: {
            where: {
              enabled: true,
            },
          },
        },
      },
    },
  });

  const teams = memberships.map((membership) => {
    const metricValues = Object.fromEntries(
      membership.team.metrics.map((metric) => [metric.key, Number(metric.value)]),
    );

    const metrics = membership.team.metrics.map((metric) => {
      const value = Number(metric.value);
      const samples = metric.samples
        .slice()
        .reverse()
        .map((sample) => ({
          id: sample.id,
          timestamp: sample.timestamp.toISOString(),
          value: sample.value,
        }));
      const previousValue = samples.at(-2)?.value ?? value;
      const delta =
        previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0;

      return {
        id: metric.id,
        key: metric.key,
        label: metric.label,
        unit: metric.unit,
        value,
        displayValue: formatMetricValue(value, metric.unit),
        delta,
        samples,
      };
    });

    const kpis = membership.team.kpis.map((kpi) => ({
      id: kpi.id,
      key: kpi.key,
      label: kpi.label,
      value: formatKpiValue(kpi.key, metricValues),
    }));

    const dashboards = membership.team.dashboards.map((dashboard) => ({
      id: dashboard.id,
      name: dashboard.name,
      slug: dashboard.slug,
      revision: dashboard.revision,
      updatedAt: dashboard.updatedAt.toISOString(),
      widgets: dashboard.widgets.map((widget) => ({
        id: widget.id,
        type: widget.type,
        position: widget.position,
        x: widget.x,
        y: widget.y,
        width: widget.width,
        height: widget.height,
        config: readWidgetConfig(widget.config),
      })),
    }));

    const alerts = membership.team.anomalyAlerts.map((alert) => ({
      id: alert.id,
      metricLabel: alert.metric.label,
      status: alert.status,
      value: Number(alert.value),
      mean: Number(alert.mean),
      stddev: Number(alert.stddev),
      triggeredAt: alert.triggeredAt.toISOString(),
    }));

    return {
      id: membership.team.id,
      name: membership.team.name,
      slug: membership.team.slug,
      role: membership.role,
      organization: {
        id: membership.team.organization.id,
        name: membership.team.organization.name,
        slug: membership.team.organization.slug,
      },
      dashboards,
      metrics,
      kpis,
      alerts,
      activeRules: membership.team.anomalyRules.length,
    };
  });

  return {
    teams,
    primaryTeam: teams[0] ?? null,
    summary: {
      teamCount: teams.length,
      dashboardCount: teams.reduce((total, team) => total + team.dashboards.length, 0),
      metricCount: teams.reduce((total, team) => total + team.metrics.length, 0),
      alertCount: teams.reduce((total, team) => total + team.alerts.length, 0),
    },
  };
}
