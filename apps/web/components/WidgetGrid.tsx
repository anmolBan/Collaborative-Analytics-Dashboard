"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Responsive,
  useContainerWidth,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from "react-grid-layout";
import type {
  DashboardBoard,
  DashboardAlert,
  DashboardKpi,
  DashboardMetric,
  DashboardWidget,
} from "../app/dashboard/action";
import { saveDashboardLayout } from "../app/dashboard/saveLayoutAction";

type WidgetGridProps = {
  activeRules: number;
  alerts: DashboardAlert[];
  dashboard: DashboardBoard | null;
  kpis: DashboardKpi[];
  metrics: DashboardMetric[];
  role: string;
};

type Breakpoint = "lg" | "md" | "sm" | "xs";

type AddOption = {
  config: DashboardWidget["config"];
  height: number;
  label: string;
  type: string;
  value: string;
  width: number;
};

type WidgetTextStyle = CSSProperties & Record<`--${string}`, string>;

type DashboardLayoutSaveWidget = {
  config: DashboardWidget["config"];
  height: number;
  id: string;
  position: number;
  type: string;
  width: number;
  x: number;
  y: number;
};

const EDITABLE_ROLES = new Set(["ADMIN", "EDITOR"]);
const BREAKPOINTS: Record<Breakpoint, number> = {
  lg: 1200,
  md: 900,
  sm: 560,
  xs: 0,
};
const COLS: Record<Breakpoint, number> = {
  lg: 12,
  md: 8,
  sm: 4,
  xs: 2,
};
const BREAKPOINT_ORDER: Breakpoint[] = ["lg", "md", "sm", "xs"];

function getWidgetTitle(
  widget: DashboardWidget,
  metrics: DashboardMetric[],
  kpis: DashboardKpi[],
) {
  const metric = metrics.find((item) => item.key === widget.config.metricKey);
  const kpi = kpis.find((item) => item.key === widget.config.kpiKey);

  if (widget.type === "ANOMALY_LIST") {
    return "Anomaly alerts";
  }

  return metric?.label ?? kpi?.label ?? "Dashboard widget";
}

function getWidgetValue(
  widget: DashboardWidget,
  metrics: DashboardMetric[],
  kpis: DashboardKpi[],
) {
  const metric = metrics.find((item) => item.key === widget.config.metricKey);
  const kpi = kpis.find((item) => item.key === widget.config.kpiKey);

  if (widget.type === "ANOMALY_LIST") {
    return "Open signals";
  }

  return metric?.displayValue ?? kpi?.value ?? "Configured";
}

function formatAlertDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toLayoutItem(
  widget: DashboardWidget,
  index: number,
  cols: number,
): LayoutItem {
  const width = Math.min(Math.max(widget.width, Math.min(cols, 2)), cols);
  const fallbackY = Math.floor(index / Math.max(Math.floor(cols / 4), 1)) * 3;

  return {
    h: Math.max(widget.height, 2),
    i: widget.id,
    minH: 2,
    minW: Math.min(cols, 2),
    w: width,
    x: Math.min(widget.x, Math.max(cols - width, 0)),
    y: Number.isFinite(widget.y) ? widget.y : fallbackY,
  };
}

function createLayouts(widgets: DashboardWidget[]): ResponsiveLayouts<Breakpoint> {
  return BREAKPOINT_ORDER.reduce<ResponsiveLayouts<Breakpoint>>(
    (layouts, breakpoint) => {
      const cols = COLS[breakpoint];

      layouts[breakpoint] = widgets.map((widget, index) =>
        toLayoutItem(widget, index, cols),
      );

      return layouts;
    },
    {},
  );
}

function findNextY(layout: Layout) {
  return layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
}

function appendLayoutItem(
  layouts: ResponsiveLayouts<Breakpoint>,
  widget: DashboardWidget,
) {
  return BREAKPOINT_ORDER.reduce<ResponsiveLayouts<Breakpoint>>(
    (nextLayouts, breakpoint) => {
      const cols = COLS[breakpoint];
      const layout = layouts[breakpoint] ?? [];
      const item = toLayoutItem(widget, layout.length, cols);

      nextLayouts[breakpoint] = [
        ...layout,
        {
          ...item,
          x: 0,
          y: findNextY(layout),
        },
      ];

      return nextLayouts;
    },
    {},
  );
}

function removeLayoutItem(
  layouts: ResponsiveLayouts<Breakpoint>,
  widgetId: string,
) {
  return BREAKPOINT_ORDER.reduce<ResponsiveLayouts<Breakpoint>>(
    (nextLayouts, breakpoint) => {
      nextLayouts[breakpoint] = (layouts[breakpoint] ?? []).filter(
        (item) => item.i !== widgetId,
      );

      return nextLayouts;
    },
    {},
  );
}

function getWidgetTextStyle(layoutItem: LayoutItem | undefined): WidgetTextStyle {
  const width = layoutItem?.w ?? 4;
  const height = layoutItem?.h ?? 2;
  const isNarrow = width <= 3;
  const isShort = height <= 2;
  const isTiny = width <= 2 || height <= 1;

  return {
    "--widget-body-gap": isTiny ? "0.35rem" : isShort ? "0.5rem" : "0.75rem",
    "--widget-eyebrow-size": isTiny ? "0.62rem" : isNarrow ? "0.68rem" : "0.75rem",
    "--widget-padding": isTiny ? "0.65rem" : isShort ? "0.8rem" : "1rem",
    "--widget-secondary-size": isTiny ? "0.68rem" : isNarrow ? "0.74rem" : "0.875rem",
    "--widget-title-gap": isTiny ? "0.55rem" : isShort ? "0.75rem" : "1.25rem",
    "--widget-title-lines": isShort ? "1" : "2",
    "--widget-title-size": isTiny ? "0.95rem" : isNarrow ? "1.05rem" : "1.25rem",
    "--widget-value-size": isTiny ? "1.25rem" : isNarrow ? "1.55rem" : "1.875rem",
  };
}

function WidgetChart({ metric }: { metric?: DashboardMetric }) {
  const samples = metric?.samples ?? [];
  const values = samples.length > 0 ? samples.map((sample) => sample.value) : [];
  const max = Math.max(...values, metric?.value ?? 1, 1);

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col">
      {metric ? (
        <>
          <div className="flex items-end justify-between gap-2">
            <strong className="dashboard-widget-value text-slate-50">
              {metric.displayValue}
            </strong>
            <span
              className={`dashboard-widget-secondary rounded-full px-2 py-1 font-bold ${
                metric.delta >= 0
                  ? "bg-teal-300/10 text-teal-100"
                  : "bg-rose-300/10 text-rose-100"
              }`}
            >
              {metric.delta >= 0 ? "+" : ""}
              {metric.delta.toFixed(1)}%
            </span>
          </div>
          <div className="mt-3 flex min-h-10 flex-1 items-end gap-2">
            {(samples.length > 0
              ? samples
              : [{ id: "current", value: metric.value }]
            ).map((sample) => (
              <span
                className="min-h-3 flex-1 rounded-t bg-teal-300/80"
                key={sample.id}
                style={{
                  height: `${Math.max((sample.value / max) * 100, 12)}%`,
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="dashboard-widget-secondary text-slate-500">
          Metric data unavailable
        </p>
      )}
    </div>
  );
}

function WidgetBody({
  activeRules,
  alerts,
  kpis,
  metrics,
  widget,
}: {
  activeRules: number;
  alerts: DashboardAlert[];
  kpis: DashboardKpi[];
  metrics: DashboardMetric[];
  widget: DashboardWidget;
}) {
  const metric = metrics.find((item) => item.key === widget.config.metricKey);
  const kpi = kpis.find((item) => item.key === widget.config.kpiKey);

  if (widget.type === "METRIC_CHART") {
    return <WidgetChart metric={metric} />;
  }

  if (widget.type === "ANOMALY_LIST") {
    return (
      <div className="dashboard-widget-body grid min-h-0 gap-2 overflow-auto pr-1">
        {alerts.length > 0 ? (
          alerts.slice(0, 3).map((alert) => (
            <div
              className="rounded-lg bg-rose-950/20 p-[var(--widget-padding)]"
              key={alert.id}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="dashboard-widget-secondary truncate font-bold text-rose-100">
                  {alert.metricLabel}
                </p>
                <span className="dashboard-widget-caption font-bold text-rose-200">
                  {alert.status}
                </span>
              </div>
              <p className="dashboard-widget-caption mt-1 leading-5 text-slate-400">
                {alert.value.toFixed(2)} vs {alert.mean.toFixed(2)} mean.
              </p>
              <p className="dashboard-widget-caption text-slate-600">
                {formatAlertDate(alert.triggeredAt)}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-slate-950/60 p-[var(--widget-padding)]">
            <p className="dashboard-widget-secondary font-bold text-slate-200">
              No active alerts
            </p>
            <p className="dashboard-widget-caption mt-1 text-slate-500">
              {activeRules} enabled rules are watching this team.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (widget.type === "KPI_CARD") {
    return (
      <div className="dashboard-widget-body">
        <strong className="dashboard-widget-value block text-amber-200">
          {kpi?.value ?? "N/A"}
        </strong>
        <p className="dashboard-widget-caption mt-2 font-bold uppercase tracking-[0.12em] text-slate-600">
          {kpi?.key ?? "KPI"}
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-widget-body">
      <strong className="dashboard-widget-value block text-slate-50">
        {metric?.displayValue ?? getWidgetValue(widget, metrics, kpis)}
      </strong>
      {metric ? (
        <p
          className={`dashboard-widget-secondary mt-2 font-bold ${
            metric.delta >= 0 ? "text-teal-200" : "text-rose-200"
          }`}
        >
          {metric.delta >= 0 ? "+" : ""}
          {metric.delta.toFixed(1)}%
        </p>
      ) : (
        <p className="dashboard-widget-secondary mt-2 text-slate-500">
          Metric data unavailable
        </p>
      )}
    </div>
  );
}

export default function WidgetGrid({
  activeRules,
  alerts,
  dashboard,
  kpis,
  metrics,
  role,
}: WidgetGridProps) {
  const canEdit = EDITABLE_ROLES.has(role);
  const initialWidgets = useMemo(
    () => dashboard?.widgets ?? [],
    [dashboard?.widgets],
  );
  const initialLayouts = useMemo(
    () => createLayouts(initialWidgets),
    [initialWidgets],
  );
  const addOptions = useMemo<AddOption[]>(
    () => [
      ...metrics.map((metric) => ({
        config: { metricKey: metric.key },
        height: 2,
        label: `Metric card - ${metric.label}`,
        type: "METRIC_CARD",
        value: `metric-card-${metric.key}`,
        width: 4,
      })),
      ...metrics.map((metric) => ({
        config: { metricKey: metric.key },
        height: 4,
        label: `Metric chart - ${metric.label}`,
        type: "METRIC_CHART",
        value: `metric-chart-${metric.key}`,
        width: 8,
      })),
      ...kpis.map((kpi) => ({
        config: { kpiKey: kpi.key },
        height: 2,
        label: `KPI card - ${kpi.label}`,
        type: "KPI_CARD",
        value: `kpi-card-${kpi.key}`,
        width: 4,
      })),
      {
        config: {},
        height: 3,
        label: "Anomaly list",
        type: "ANOMALY_LIST",
        value: "anomaly-list",
        width: 4,
      },
    ],
    [kpis, metrics],
  );
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets);
  const [layouts, setLayouts] =
    useState<ResponsiveLayouts<Breakpoint>>(initialLayouts);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>("lg");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedOption, setSelectedOption] = useState(
    addOptions[0]?.value ?? "",
  );
  const [draftCounter, setDraftCounter] = useState(1);
  const { containerRef, mounted, width } = useContainerWidth({
    initialWidth: 900,
    measureBeforeMount: true,
  });

  const selectedAddOption =
    addOptions.find((option) => option.value === selectedOption) ??
    addOptions[0];
  const currentLayout = layouts[currentBreakpoint] ?? layouts.lg ?? [];

  function addWidget() {
    if (!selectedAddOption) {
      return;
    }

    const widget: DashboardWidget = {
      config: selectedAddOption.config,
      height: selectedAddOption.height,
      id: `draft-widget-${Date.now()}-${draftCounter}`,
      position: widgets.length,
      type: selectedAddOption.type,
      width: selectedAddOption.width,
      x: 0,
      y: 0,
    };

    setDraftCounter((current) => current + 1);
    setSaveMessage("");
    setWidgets((current) => [...current, widget]);
    setLayouts((current) => appendLayoutItem(current, widget));
  }

  function removeWidget(widgetId: string) {
    setSaveMessage("");
    setWidgets((current) =>
      current.filter((widget) => widget.id !== widgetId),
    );
    setLayouts((current) => removeLayoutItem(current, widgetId));
  }

  function resetDraft() {
    setWidgets(initialWidgets);
    setLayouts(initialLayouts);
    setIsEditing(false);
  }

  function getWidgetsForSave() {
    const itemById = new Map(currentLayout.map((item) => [item.i, item]));

    return widgets
      .map<DashboardLayoutSaveWidget>((widget, index) => {
        const item = itemById.get(widget.id);

        return {
          config: widget.config,
          height: Math.max(Math.round(item?.h ?? widget.height), 1),
          id: widget.id,
          position: index,
          type: widget.type,
          width: Math.max(Math.round(item?.w ?? widget.width), 1),
          x: Math.max(Math.round(item?.x ?? widget.x), 0),
          y: Math.max(Math.round(item?.y ?? widget.y), 0),
        };
      })
      .sort((left, right) => left.y - right.y || left.x - right.x)
      .map((widget, index) => ({
        ...widget,
        position: index,
      }));
  }

  async function doneClickHandler() {
    if (!dashboard) {
      return;
    }

    const widgetsForSave = getWidgetsForSave();

    setIsSaving(true);
    setSaveMessage("");

    try {
      await saveDashboardLayout({
        dashboardId: dashboard.id,
        widgets: widgetsForSave,
      });

      setWidgets(widgetsForSave);
      setIsEditing(false);
      setSaveMessage("Saved");
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Could not save layout.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-500/15 bg-[#0d1316] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">
            Dashboard layout
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-50">Widgets</h2>
        </div>

        {canEdit ? (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {isEditing ? (
              <>
                <button
                  className="dashboard-editor-control inline-flex h-10 items-center justify-center rounded-lg border border-slate-400/20 bg-slate-950/60 px-3 text-xs font-extrabold text-slate-200 transition hover:border-rose-200/40 hover:text-rose-100"
                  onClick={resetDraft}
                  type="button"
                >
                  Reset
                </button>
                <button
                  className="dashboard-editor-control inline-flex h-10 items-center justify-center rounded-lg bg-teal-300 px-4 text-xs font-extrabold text-[#041010] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                  disabled={isSaving || !dashboard}
                  onClick={doneClickHandler}
                  type="button"
                >
                  {isSaving ? "Saving" : "Done"}
                </button>
              </>
            ) : (
              <button
                aria-label="Edit dashboard widgets"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-teal-300 px-4 text-sm font-extrabold text-[#041010] transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:ring-offset-2 focus:ring-offset-[#0d1316]"
                onClick={() => {
                  setSaveMessage("");
                  setIsEditing(true);
                }}
                type="button"
              >
                Edit
              </button>
            )}
            {saveMessage ? (
              <span
                className={`text-xs font-bold ${
                  saveMessage === "Saved" ? "text-teal-200" : "text-rose-200"
                }`}
              >
                {saveMessage}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {isEditing ? (
        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-slate-500/15 bg-slate-950/40 p-3 sm:flex-row">
          <select
            className="dashboard-editor-control h-11 flex-1 rounded-lg border border-slate-500/20 bg-[#070a0d] px-3 text-sm font-bold text-slate-200 outline-none transition focus:border-teal-200/50"
            onChange={(event) => setSelectedOption(event.target.value)}
            value={selectedOption}
          >
            {addOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            className="dashboard-editor-control inline-flex h-11 items-center justify-center rounded-lg bg-slate-50 px-4 text-sm font-extrabold text-slate-950 transition hover:bg-teal-200"
            onClick={addWidget}
            type="button"
          >
            Add widget
          </button>
        </div>
      ) : null}

      <div className="mt-5" ref={containerRef}>
        {mounted ? (
          <Responsive
            breakpoints={BREAKPOINTS}
            className={isEditing ? "dashboard-layout editing" : "dashboard-layout"}
            cols={COLS}
            dragConfig={{
              cancel: ".dashboard-editor-control",
              enabled: canEdit && isEditing,
              handle: ".dashboard-widget-drag-handle",
            }}
            layouts={layouts}
            margin={[16, 16]}
            onBreakpointChange={(breakpoint) => {
              setCurrentBreakpoint(breakpoint);
            }}
            onLayoutChange={(_, nextLayouts) => {
              setLayouts(nextLayouts);
            }}
            resizeConfig={{
              enabled: canEdit && isEditing,
              handles: ["se"],
            }}
            rowHeight={72}
            width={width}
          >
            {widgets.map((widget) => {
              const layoutItem = currentLayout.find(
                (item) => item.i === widget.id,
              );

              return (
                <div className="dashboard-widget-shell" key={widget.id}>
                  <div
                    className="dashboard-widget-card flex h-full flex-col rounded-lg border border-slate-500/15 bg-slate-950/60"
                    style={getWidgetTextStyle(layoutItem)}
                  >
                    <div className="dashboard-widget-drag-handle flex items-start justify-between gap-3">
                      <span className="dashboard-widget-eyebrow font-extrabold uppercase tracking-[0.14em] text-slate-500">
                        {widget.type.replace("_", " ")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="dashboard-widget-caption text-slate-600">
                          {layoutItem?.w ?? widget.width}x
                          {layoutItem?.h ?? widget.height}
                        </span>
                        {isEditing ? (
                          <button
                            aria-label={`Remove ${getWidgetTitle(
                              widget,
                              metrics,
                              kpis,
                            )}`}
                            className="dashboard-editor-control grid h-7 w-7 place-items-center rounded-md border border-slate-500/20 text-sm font-black text-slate-500 transition hover:border-rose-200/40 hover:text-rose-100"
                            onClick={() => removeWidget(widget.id)}
                            type="button"
                          >
                            x
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <h3 className="dashboard-widget-title font-extrabold text-slate-50">
                      {getWidgetTitle(widget, metrics, kpis)}
                    </h3>
                    <WidgetBody
                      activeRules={activeRules}
                      alerts={alerts}
                      kpis={kpis}
                      metrics={metrics}
                      widget={widget}
                    />
                  </div>
                </div>
              );
            })}
          </Responsive>
        ) : null}

        {widgets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-500/20 bg-slate-950/40 p-6">
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
