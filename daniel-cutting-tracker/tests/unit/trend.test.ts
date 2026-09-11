import { describe, expect, it } from "vitest";
import {
  calculateActivityAverages,
  calculateEnergyBalanceTrend,
  calculateNutritionAverages,
  calculateRollingAverage,
  calculateWeightTrend,
} from "@/lib/analysis/trend";

describe("calculateRollingAverage", () => {
  it("computes a trailing average bounded by the window size", () => {
    const points = [
      { date: "2026-09-01", value: 10 },
      { date: "2026-09-02", value: 20 },
      { date: "2026-09-03", value: 30 },
    ];
    const result = calculateRollingAverage(points, 2);
    expect(result[0].value).toBe(10); // only itself
    expect(result[1].value).toBe(15); // (10+20)/2
    expect(result[2].value).toBe(25); // (20+30)/2
  });

  it("sorts input by date before computing", () => {
    const points = [
      { date: "2026-09-02", value: 20 },
      { date: "2026-09-01", value: 10 },
    ];
    const result = calculateRollingAverage(points, 7);
    expect(result.map((p) => p.date)).toEqual(["2026-09-01", "2026-09-02"]);
  });
});

describe("calculateWeightTrend", () => {
  it("reports insufficient data with fewer than 3 entries", () => {
    const result = calculateWeightTrend([{ date: "2026-09-01", weightKg: 100 }]);
    expect(result.hasEnoughData).toBe(false);
    expect(result.message).toContain("insuficientes");
  });

  it("reports insufficient data when entries don't span enough days", () => {
    const result = calculateWeightTrend([
      { date: "2026-09-01", weightKg: 100 },
      { date: "2026-09-02", weightKg: 99.8 },
      { date: "2026-09-03", weightKg: 99.6 },
    ]);
    expect(result.hasEnoughData).toBe(false);
  });

  // TEST: never judged from a single weigh-in -- a noisy single-day uptick
  // inside an overall downward trend should not flip the verdict.
  it("detects a downward trend from a consistent multi-week decline", () => {
    const entries = [];
    let weight = 111;
    for (let day = 0; day < 21; day++) {
      const date = new Date(2026, 8, 1 + day).toISOString().slice(0, 10);
      weight -= day % 3 === 0 ? -0.1 : 0.15; // mostly down, occasional small uptick (noise)
      entries.push({ date, weightKg: Math.round(weight * 100) / 100 });
    }
    const result = calculateWeightTrend(entries);
    expect(result.hasEnoughData).toBe(true);
    expect(result.direction).toBe("down");
  });

  it("detects stability when weight barely moves over the window", () => {
    const entries = Array.from({ length: 14 }, (_, day) => ({
      date: new Date(2026, 8, 1 + day).toISOString().slice(0, 10),
      weightKg: 100 + (day % 2 === 0 ? 0.05 : -0.05),
    }));
    const result = calculateWeightTrend(entries);
    expect(result.hasEnoughData).toBe(true);
    expect(result.direction).toBe("stable");
  });

  it("detects an upward trend", () => {
    const entries = Array.from({ length: 14 }, (_, day) => ({
      date: new Date(2026, 8, 1 + day).toISOString().slice(0, 10),
      weightKg: 100 + day * 0.15,
    }));
    const result = calculateWeightTrend(entries);
    expect(result.hasEnoughData).toBe(true);
    expect(result.direction).toBe("up");
  });
});

describe("calculateNutritionAverages", () => {
  it("averages across the provided days", () => {
    const result = calculateNutritionAverages([
      { caloriesConsumedKcal: 2000, proteinConsumedG: 180, carbsConsumedG: 200, fatConsumedG: 70, fiberConsumedG: 30 },
      { caloriesConsumedKcal: 2400, proteinConsumedG: 200, carbsConsumedG: 220, fatConsumedG: 80, fiberConsumedG: 34 },
    ]);
    expect(result.avgCalories).toBe(2200);
    expect(result.avgProtein).toBe(190);
    expect(result.days).toBe(2);
  });

  it("returns zeros for an empty period instead of NaN", () => {
    const result = calculateNutritionAverages([]);
    expect(result.avgCalories).toBe(0);
    expect(Number.isNaN(result.avgCalories)).toBe(false);
  });
});

describe("calculateActivityAverages", () => {
  it("counts sessions by group and averages steps/activity calories over the full period", () => {
    const activities = [
      { activityType: "weight_training", steps: null, caloriesBurned: 600, includedInActivityTotal: true },
      { activityType: "weight_training", steps: null, caloriesBurned: 620, includedInActivityTotal: true },
      { activityType: "swimming", steps: null, caloriesBurned: 400, includedInActivityTotal: true },
      { activityType: "steps", steps: 8000, caloriesBurned: 300, includedInActivityTotal: true },
      { activityType: "sports", steps: null, caloriesBurned: 700, includedInActivityTotal: true },
    ];
    const result = calculateActivityAverages(activities, [1000, 1000], 2);
    expect(result.weightTrainingSessions).toBe(2);
    expect(result.swimmingSessions).toBe(1);
    expect(result.otherSessions).toBe(1); // "sports" falls into "outras"
    expect(result.avgSteps).toBe(4000); // 8000 total / 2 days
    expect(result.avgActivityCaloriesPerDay).toBe(1000);
  });
});

describe("calculateEnergyBalanceTrend", () => {
  it("computes average estimated deficit as consumed minus TDEE", () => {
    const result = calculateEnergyBalanceTrend([
      { caloriesConsumedKcal: 1800, estimatedTdeeKcal: 2700, totalActivityCaloriesKcal: 900 },
      { caloriesConsumedKcal: 2000, estimatedTdeeKcal: 2600, totalActivityCaloriesKcal: 800 },
    ]);
    expect(result.avgEstimatedDeficitKcal).toBe(-750);
    expect(result.avgEstimatedTdeeKcal).toBe(2650);
  });
});
