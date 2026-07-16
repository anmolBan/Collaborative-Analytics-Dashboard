import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./index.js";
import { KpiKey, MetricKey, Role, WidgetType } from "../generated/prisma/enums.js";

const passwordHash = await bcrypt.hash("Password123!", 10);

type MetricSeed = {
  key: MetricKey;
  label: string;
  unit: string;
  value: number;
};

async function seedTeamAnalytics({
  anomalyMetricIndex,
  dashboardName,
  dashboardSlug,
  metrics,
  teamId,
}: {
  anomalyMetricIndex: number;
  dashboardName: string;
  dashboardSlug: string;
  metrics: MetricSeed[];
  teamId: string;
}) {
  const seededMetrics = await Promise.all(
    metrics.map((metric) =>
      prisma.metric.upsert({
        where: { teamId_key: { teamId, key: metric.key } },
        update: { value: metric.value, label: metric.label, unit: metric.unit },
        create: {
          teamId,
          key: metric.key,
          label: metric.label,
          value: metric.value,
          unit: metric.unit,
        },
      }),
    ),
  );

  await Promise.all(
    seededMetrics.map((metric) =>
      prisma.metricSample.create({
        data: {
          metricId: metric.id,
          value: metric.value.toNumber(),
          timestamp: new Date(),
        },
      }),
    ),
  );

  await Promise.all([
    prisma.kpiDefinition.upsert({
      where: { teamId_key: { teamId, key: KpiKey.ARPU } },
      update: {},
      create: {
        teamId,
        key: KpiKey.ARPU,
        label: "ARPU",
      },
    }),
    prisma.kpiDefinition.upsert({
      where: { teamId_key: { teamId, key: KpiKey.ERROR_RATE } },
      update: {},
      create: {
        teamId,
        key: KpiKey.ERROR_RATE,
        label: "Error Rate",
      },
    }),
  ]);

  const dashboard = await prisma.dashboard.upsert({
    where: { slug: dashboardSlug },
    update: { name: dashboardName, teamId },
    create: {
      name: dashboardName,
      slug: dashboardSlug,
      teamId,
    },
  });

  await prisma.dashboardWidget.deleteMany({
    where: { dashboardId: dashboard.id },
  });

  await prisma.dashboardWidget.createMany({
    data: [
      {
        dashboardId: dashboard.id,
        type: WidgetType.METRIC_CARD,
        position: 0,
        config: { metricKey: MetricKey.REVENUE },
        x: 0,
        y: 0,
        width: 4,
        height: 2,
      },
      {
        dashboardId: dashboard.id,
        type: WidgetType.METRIC_CHART,
        position: 1,
        config: { metricKey: MetricKey.PAGE_VIEWS },
        x: 4,
        y: 0,
        width: 8,
        height: 4,
      },
      {
        dashboardId: dashboard.id,
        type: WidgetType.KPI_CARD,
        position: 2,
        config: { kpiKey: KpiKey.ARPU },
        x: 0,
        y: 2,
        width: 4,
        height: 2,
      },
    ],
  });

  const anomalyMetric = seededMetrics[anomalyMetricIndex];

  if (anomalyMetric) {
    await prisma.anomalyRule.upsert({
      where: { id: `${dashboardSlug}-anomaly-rule` },
      update: {
        teamId,
        metricId: anomalyMetric.id,
        enabled: true,
      },
      create: {
        id: `${dashboardSlug}-anomaly-rule`,
        teamId,
        metricId: anomalyMetric.id,
        standardDevs: 2,
        lookbackSamples: 30,
      },
    });
  }
}

const organization = await prisma.organization.upsert({
  where: { slug: "buildable-labs" },
  update: {},
  create: {
    name: "Buildable Labs",
    slug: "buildable-labs",
  },
});

const financeTeam = await prisma.team.upsert({
  where: {
    organizationId_slug: {
      organizationId: organization.id,
      slug: "finance",
    },
  },
  update: {},
  create: {
    name: "Finance",
    slug: "finance",
    organizationId: organization.id,
  },
});

const marketingTeam = await prisma.team.upsert({
  where: {
    organizationId_slug: {
      organizationId: organization.id,
      slug: "marketing",
    },
  },
  update: {},
  create: {
    name: "Marketing",
    slug: "marketing",
    organizationId: organization.id,
  },
});

const users = await Promise.all([
  prisma.user.upsert({
    where: { email: "admin@buildable.test" },
    update: { passwordHash },
    create: {
      email: "admin@buildable.test",
      name: "Finance Admin",
      passwordHash,
    },
  }),
  prisma.user.upsert({
    where: { email: "editor@buildable.test" },
    update: { passwordHash },
    create: {
      email: "editor@buildable.test",
      name: "Finance Editor",
      passwordHash,
    },
  }),
  prisma.user.upsert({
    where: { email: "viewer@buildable.test" },
    update: { passwordHash },
    create: {
      email: "viewer@buildable.test",
      name: "Marketing Viewer",
      passwordHash,
    },
  }),
]);

await Promise.all([
  prisma.teamMembership.upsert({
    where: {
      userId_teamId: {
        userId: users[0].id,
        teamId: financeTeam.id,
      },
    },
    update: { role: Role.ADMIN },
    create: {
      userId: users[0].id,
      teamId: financeTeam.id,
      role: Role.ADMIN,
    },
  }),
  prisma.teamMembership.upsert({
    where: {
      userId_teamId: {
        userId: users[1].id,
        teamId: financeTeam.id,
      },
    },
    update: { role: Role.EDITOR },
    create: {
      userId: users[1].id,
      teamId: financeTeam.id,
      role: Role.EDITOR,
    },
  }),
  prisma.teamMembership.upsert({
    where: {
      userId_teamId: {
        userId: users[2].id,
        teamId: marketingTeam.id,
      },
    },
    update: { role: Role.VIEWER },
    create: {
      userId: users[2].id,
      teamId: marketingTeam.id,
      role: Role.VIEWER,
    },
  }),
]);

await seedTeamAnalytics({
  anomalyMetricIndex: 2,
  dashboardName: "Finance Overview",
  dashboardSlug: "finance-overview",
  teamId: financeTeam.id,
  metrics: [
    { key: MetricKey.PAGE_VIEWS, label: "Page Views", value: 12480, unit: "views" },
    { key: MetricKey.CLICKS, label: "Clicks", value: 2430, unit: "clicks" },
    { key: MetricKey.ERRORS, label: "Errors", value: 18, unit: "errors" },
    { key: MetricKey.REVENUE, label: "Revenue", value: 84200, unit: "usd" },
    { key: MetricKey.USERS, label: "Users", value: 1320, unit: "users" },
  ],
});

await seedTeamAnalytics({
  anomalyMetricIndex: 2,
  dashboardName: "Marketing Overview",
  dashboardSlug: "marketing-overview",
  teamId: marketingTeam.id,
  metrics: [
    { key: MetricKey.PAGE_VIEWS, label: "Page Views", value: 38640, unit: "views" },
    { key: MetricKey.CLICKS, label: "Clicks", value: 6120, unit: "clicks" },
    { key: MetricKey.ERRORS, label: "Errors", value: 7, unit: "errors" },
    { key: MetricKey.REVENUE, label: "Attributed Revenue", value: 52750, unit: "usd" },
    { key: MetricKey.USERS, label: "Visitors", value: 4180, unit: "users" },
  ],
});

await prisma.$disconnect();

console.log("Seeded demo organization, Finance and Marketing teams, users, dashboards, metrics, KPIs, and anomaly rules.");
