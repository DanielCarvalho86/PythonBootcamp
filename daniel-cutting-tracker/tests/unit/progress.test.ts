import { describe, expect, it } from "vitest";
import { buildProgressSummary } from "@/lib/analysis/progress";

describe("buildProgressSummary", () => {
  it("computes initial vs current weight and total change", () => {
    const summary = buildProgressSummary({
      referenceWeightKg: 111,
      referenceWeightDate: "2026-08-01",
      weightEntries: [
        { date: "2026-09-01", weightKg: 108.5 },
        { date: "2026-09-05", weightKg: 108.0 },
        { date: "2026-09-10", weightKg: 107.45 },
      ],
      dailyLogs: [
        { date: "2026-09-10", caloriesConsumedKcal: 2200, proteinConsumedG: 190, carbsConsumedG: 200, fatConsumedG: 75, fiberConsumedG: 32, estimatedTdeeKcal: 2700, totalActivityCaloriesKcal: 900 },
      ],
      activities: [{ activityType: "weight_training", steps: null, caloriesBurned: 600, includedInActivityTotal: true }],
      periodDays: 1,
    });

    expect(summary.weight.initialWeightKg).toBe(111);
    expect(summary.weight.currentWeightKg).toBe(107.45);
    expect(summary.weight.totalChangeKg).toBeCloseTo(-3.55, 2);
    expect(summary.nutrition.avgCalories).toBe(2200);
    expect(summary.activity.weightTrainingSessions).toBe(1);
    expect(summary.energy.avgEstimatedDeficitKcal).toBe(-500);
  });

  it("handles an empty period without crashing or producing NaN", () => {
    const summary = buildProgressSummary({
      referenceWeightKg: 111,
      referenceWeightDate: "2026-08-01",
      weightEntries: [],
      dailyLogs: [],
      activities: [],
      periodDays: 7,
    });
    expect(summary.weight.currentWeightKg).toBeNull();
    expect(summary.weight.totalChangeKg).toBeNull();
    expect(summary.trend.hasEnoughData).toBe(false);
    expect(Number.isNaN(summary.nutrition.avgCalories)).toBe(false);
  });
});
