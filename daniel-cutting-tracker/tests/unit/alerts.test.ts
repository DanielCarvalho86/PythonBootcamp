import { describe, expect, it } from "vitest";
import { detectAlerts, type DailyLogPoint, type DetectAlertsInput } from "@/lib/analysis/alerts";
import type { WeightTrendResult } from "@/lib/analysis/trend";

const NO_TREND: WeightTrendResult = {
  hasEnoughData: false,
  direction: null,
  latestAverageKg: null,
  priorAverageKg: null,
  changeKg: null,
  changePerWeekKg: null,
  message: "Dados insuficientes para calcular tendencia.",
};

function day(overrides: Partial<DailyLogPoint> = {}): DailyLogPoint {
  return {
    date: "2026-09-10",
    caloriesConsumedKcal: 2200,
    proteinConsumedG: 190,
    estimatedTdeeKcal: 2700,
    waterMl: 3200,
    hunger: null,
    energy: null,
    trainingPerformance: null,
    ...overrides,
  };
}

const TARGETS = { caloriesMin: 2150, proteinMin: 190, waterMinMl: 3000 };

function baseInput(overrides: Partial<DetectAlertsInput> = {}): DetectAlertsInput {
  return {
    recentDailyLogs: Array.from({ length: 7 }, () => day()),
    weightTrend: NO_TREND,
    avgActivityCaloriesPerDay: 400,
    targets: TARGETS,
    ...overrides,
  };
}

describe("detectAlerts", () => {
  it("returns nothing when everything is on track", () => {
    expect(detectAlerts(baseInput())).toHaveLength(0);
  });

  it("never fires with too few days of data, even if every day looks bad", () => {
    const input = baseInput({
      recentDailyLogs: [day({ proteinConsumedG: 50 }), day({ proteinConsumedG: 50 })],
    });
    expect(detectAlerts(input).find((a) => a.type === "LOW_PROTEIN")).toBeUndefined();
  });

  // LOW_PROTEIN
  it("flags LOW_PROTEIN when protein is under target on most of the last 7 days", () => {
    const logs = [
      day({ proteinConsumedG: 140 }),
      day({ proteinConsumedG: 145 }),
      day({ proteinConsumedG: 150 }),
      day({ proteinConsumedG: 150 }),
      day({ proteinConsumedG: 190 }),
      day({ proteinConsumedG: 195 }),
      day({ proteinConsumedG: 190 }),
    ];
    const alert = detectAlerts(baseInput({ recentDailyLogs: logs })).find((a) => a.type === "LOW_PROTEIN");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("NOTICE");
  });

  it("does not flag LOW_PROTEIN for a single bad day", () => {
    const logs = [day({ proteinConsumedG: 100 }), ...Array.from({ length: 6 }, () => day())];
    expect(detectAlerts(baseInput({ recentDailyLogs: logs })).find((a) => a.type === "LOW_PROTEIN")).toBeUndefined();
  });

  // LOW_HYDRATION
  it("flags LOW_HYDRATION on persistent low water intake", () => {
    const logs = Array.from({ length: 7 }, (_, i) => day({ waterMl: i < 4 ? 1800 : 3200 }));
    const alert = detectAlerts(baseInput({ recentDailyLogs: logs })).find((a) => a.type === "LOW_HYDRATION");
    expect(alert).toBeDefined();
  });

  // LOW_INTAKE
  it("flags LOW_INTAKE without recommending eating even less", () => {
    const logs = Array.from({ length: 7 }, (_, i) => day({ caloriesConsumedKcal: i < 4 ? 1400 : 2200 }));
    const alert = detectAlerts(baseInput({ recentDailyLogs: logs })).find((a) => a.type === "LOW_INTAKE");
    expect(alert).toBeDefined();
    expect(alert!.message).toMatch(/nao deve ser corrigido reduzindo ainda mais/i);
  });

  // HIGH_DEFICIT
  it("flags HIGH_DEFICIT and never proposes fasting/compensation", () => {
    const logs = Array.from({ length: 7 }, (_, i) =>
      day({ caloriesConsumedKcal: i < 5 ? 1500 : 2200, estimatedTdeeKcal: 2700 }),
    );
    const alert = detectAlerts(baseInput({ recentDailyLogs: logs })).find((a) => a.type === "HIGH_DEFICIT");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("WARNING");
    // Must explicitly deny recommending fasting/compensation, not just omit the topic.
    expect(alert!.message).toMatch(/nao vamos recomendar jejum/i);
  });

  // RAPID_WEIGHT_LOSS
  it("flags RAPID_WEIGHT_LOSS from the trend, not a single weigh-in", () => {
    const rapidTrend: WeightTrendResult = {
      hasEnoughData: true,
      direction: "down",
      latestAverageKg: 105,
      priorAverageKg: 106.5,
      changeKg: -1.5,
      changePerWeekKg: -1.5,
      message: "x",
    };
    const alert = detectAlerts(baseInput({ weightTrend: rapidTrend })).find((a) => a.type === "RAPID_WEIGHT_LOSS");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("WARNING");
  });

  it("does not flag RAPID_WEIGHT_LOSS for an ordinary, gradual loss", () => {
    const gentleTrend: WeightTrendResult = {
      hasEnoughData: true,
      direction: "down",
      latestAverageKg: 105,
      priorAverageKg: 105.4,
      changeKg: -0.4,
      changePerWeekKg: -0.4,
      message: "x",
    };
    expect(detectAlerts(baseInput({ weightTrend: gentleTrend })).find((a) => a.type === "RAPID_WEIGHT_LOSS")).toBeUndefined();
  });

  it("does not flag RAPID_WEIGHT_LOSS when the trend is insufficient", () => {
    expect(detectAlerts(baseInput({ weightTrend: NO_TREND })).find((a) => a.type === "RAPID_WEIGHT_LOSS")).toBeUndefined();
  });

  // LOW_ENERGY / HIGH_HUNGER / PERFORMANCE_DROP -- opt-in subjective fields
  it("flags LOW_ENERGY only when enough subjective check-ins exist", () => {
    const logs = [day({ energy: 1 }), day({ energy: 2 }), day({ energy: 2 }), day(), day(), day(), day()];
    const alert = detectAlerts(baseInput({ recentDailyLogs: logs })).find((a) => a.type === "LOW_ENERGY");
    expect(alert).toBeDefined();
  });

  it("never fires LOW_ENERGY when energy was never logged", () => {
    expect(detectAlerts(baseInput()).find((a) => a.type === "LOW_ENERGY")).toBeUndefined();
  });

  it("flags HIGH_HUNGER without auto-suggesting fewer calories", () => {
    const logs = [day({ hunger: 5 }), day({ hunger: 4 }), day({ hunger: 5 }), day(), day(), day(), day()];
    const alert = detectAlerts(baseInput({ recentDailyLogs: logs })).find((a) => a.type === "HIGH_HUNGER");
    expect(alert).toBeDefined();
    expect(alert!.message).toMatch(/nao deve ser respondido reduzindo/i);
  });

  it("flags PERFORMANCE_DROP from repeated low training-performance check-ins", () => {
    const logs = [
      day({ trainingPerformance: 1 }),
      day({ trainingPerformance: 2 }),
      day({ trainingPerformance: 2 }),
      day(),
      day(),
      day(),
      day(),
    ];
    const alert = detectAlerts(baseInput({ recentDailyLogs: logs })).find((a) => a.type === "PERFORMANCE_DROP");
    expect(alert).toBeDefined();
  });

  // HIGH_ACTIVITY
  it("flags HIGH_ACTIVITY as informational only, never raising the food target", () => {
    const alert = detectAlerts(baseInput({ avgActivityCaloriesPerDay: 1200 })).find((a) => a.type === "HIGH_ACTIVITY");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("INFO");
    // Must explicitly deny raising the target, not just omit the topic.
    expect(alert!.message).toMatch(/nao aumenta automaticamente sua meta/i);
  });

  it("groups multiple alerts into a single list rather than one per bad day", () => {
    const logs = Array.from({ length: 7 }, (_, i) =>
      day({ proteinConsumedG: i < 5 ? 120 : 190, waterMl: i < 5 ? 1500 : 3200 }),
    );
    const alerts = detectAlerts(baseInput({ recentDailyLogs: logs }));
    const lowProteinAlerts = alerts.filter((a) => a.type === "LOW_PROTEIN");
    expect(lowProteinAlerts).toHaveLength(1); // one summarizing alert, not five
  });
});
