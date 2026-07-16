"use server";

import prisma from "@repo/db";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "../../lib/authOptions";

const widgetConfigSchema = z
  .object({
    kpiKey: z.string().optional(),
    metricKey: z.string().optional(),
  })
  .strict();

const saveDashboardLayoutSchema = z.object({
  dashboardId: z.string().min(1),
  widgets: z.array(
    z.object({
      config: widgetConfigSchema,
      height: z.number().int().min(1).max(20),
      id: z.string().min(1),
      position: z.number().int().min(0),
      type: z.enum(["METRIC_CARD", "METRIC_CHART", "KPI_CARD", "ANOMALY_LIST"]),
      width: z.number().int().min(1).max(12),
      x: z.number().int().min(0).max(12),
      y: z.number().int().min(0).max(200),
    }),
  ),
});

function normalizeWidgetConfig(config: z.infer<typeof widgetConfigSchema>) {
  return {
    ...(config.metricKey ? { metricKey: config.metricKey } : {}),
    ...(config.kpiKey ? { kpiKey: config.kpiKey } : {}),
  };
}

export async function saveDashboardLayout(input: unknown) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("You must be signed in to save this dashboard.");
  }

  const parsed = saveDashboardLayoutSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("Invalid dashboard layout payload.");
  }

  const { dashboardId, widgets } = parsed.data;

  const dashboard = await prisma.dashboard.findFirst({
    where: {
      id: dashboardId,
      team: {
        memberships: {
          some: {
            role: {
              in: ["ADMIN", "EDITOR"],
            },
            userId: session.user.id,
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (!dashboard) {
    throw new Error("You do not have permission to edit this dashboard.");
  }

  const normalizedWidgets = widgets
    .slice()
    .sort((left, right) => left.position - right.position)
    .map((widget, index) => ({
      config: normalizeWidgetConfig(widget.config),
      dashboardId,
      height: widget.height,
      id: widget.id,
      position: index,
      type: widget.type,
      width: widget.width,
      x: widget.x,
      y: widget.y,
    }));

  const updatedDashboard = await prisma.$transaction(async (tx) => {
    await tx.dashboardWidget.deleteMany({
      where: {
        dashboardId,
      },
    });

    if (normalizedWidgets.length > 0) {
      await tx.dashboardWidget.createMany({
        data: normalizedWidgets,
      });
    }

    return tx.dashboard.update({
      data: {
        revision: {
          increment: 1,
        },
      },
      select: {
        revision: true,
        updatedAt: true,
      },
      where: {
        id: dashboardId,
      },
    });
  });

  revalidatePath("/dashboard");

  return {
    revision: updatedDashboard.revision,
    updatedAt: updatedDashboard.updatedAt.toISOString(),
  };
}
