import { z } from "zod";

export const roleSchema = z.enum(["ADMIN", "EDITOR", "VIEWER"]);

export const widgetTypeSchema = z.enum([
  "METRIC_CARD",
  "METRIC_CHART",
  "KPI_CARD",
  "ANOMALY_LIST",
]);

export const metricKeySchema = z.enum([
  "PAGE_VIEWS",
  "CLICKS",
  "ERRORS",
  "REVENUE",
  "USERS",
]);

export const kpiKeySchema = z.enum(["ARPU", "ERROR_RATE"]);

export const dashboardWidgetSchema = z.object({
  id: z.string().optional(),
  type: widgetTypeSchema,
  position: z.number().int().min(0),
  config: z.record(z.string(), z.unknown()),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const dashboardPatchMessageSchema = z.object({
  type: z.literal("dashboard:patch"),
  payload: z.object({
    dashboardId: z.string(),
    baseRevision: z.number().int().min(0),
    widgets: z.array(dashboardWidgetSchema),
  }),
});

export const UserSigninSchema = z.object({
  email: z.string(),
  password: z.string().min(8),
});

export type Role = z.infer<typeof roleSchema>;
export type DashboardPatchMessage = z.infer<typeof dashboardPatchMessageSchema>;
export type UserSignin = z.infer<typeof UserSigninSchema>;
