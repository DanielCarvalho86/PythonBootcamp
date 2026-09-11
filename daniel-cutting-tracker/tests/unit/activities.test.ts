import { describe, expect, it } from "vitest";
import {
  calculateActivityTotal,
  calculateEnergyBalance,
  calculateEstimatedTDEE,
  detectStepDoubleCounting,
  estimateStepsCalories,
  type ActivityRecord,
} from "@/lib/activities/engine";

function activity(overrides: Partial<ActivityRecord>): ActivityRecord {
  return {
    id: overrides.id ?? "a1",
    activityType: overrides.activityType ?? "other",
    caloriesBurned: overrides.caloriesBurned ?? 0,
    caloriesSource: overrides.caloriesSource ?? "user",
    steps: overrides.steps ?? null,
    durationMinutes: overrides.durationMinutes ?? null,
    includedInActivityTotal: overrides.includedInActivityTotal ?? true,
  };
}

describe("calculateActivityTotal", () => {
  // TEST9: musculacao
  it("sums a single weight training session", () => {
    const total = calculateActivityTotal([
      activity({ activityType: "weight_training", durationMinutes: 75, caloriesBurned: 620 }),
    ]);
    expect(total).toBe(620);
  });

  // TEST10: natacao
  it("sums a swimming session", () => {
    const total = calculateActivityTotal([activity({ activityType: "swimming", durationMinutes: 45, caloriesBurned: 400 })]);
    expect(total).toBe(400);
  });

  // TEST11: passos
  it("sums a steps entry", () => {
    const total = calculateActivityTotal([activity({ activityType: "steps", steps: 8500, caloriesBurned: 350 })]);
    expect(total).toBe(350);
  });

  // TEST12: outra atividade (ex: futebol)
  it("sums a generic 'sports' activity", () => {
    const total = calculateActivityTotal([activity({ activityType: "sports", durationMinutes: 60, caloriesBurned: 700 })]);
    expect(total).toBe(700);
  });

  // TEST14: total de calorias de atividade combinando varias atividades no dia
  it("sums calories across multiple different activities the same day", () => {
    const total = calculateActivityTotal([
      activity({ id: "a", activityType: "weight_training", caloriesBurned: 620 }),
      activity({ id: "b", activityType: "swimming", caloriesBurned: 400 }),
      activity({ id: "c", activityType: "steps", caloriesBurned: 350 }),
    ]);
    expect(total).toBe(1370);
  });

  // TEST13: evitar dupla contagem de passos
  it("excludes activities flagged as already included in another entry's total", () => {
    const total = calculateActivityTotal([
      activity({ id: "walk", activityType: "walking", caloriesBurned: 180, includedInActivityTotal: true }),
      activity({ id: "steps", activityType: "steps", caloriesBurned: 180, includedInActivityTotal: false }),
    ]);
    expect(total).toBe(180);
  });

  // TEST26: atividade muito elevada -- still sums correctly, no silent clamping
  it("does not clamp unusually high activity calories", () => {
    const total = calculateActivityTotal([activity({ activityType: "cardio", caloriesBurned: 3000 })]);
    expect(total).toBe(3000);
  });
});

describe("detectStepDoubleCounting", () => {
  it("warns when a steps entry coexists with a walking/running entry", () => {
    const warnings = detectStepDoubleCounting([
      activity({ id: "steps", activityType: "steps", caloriesBurned: 350 }),
      activity({ id: "walk", activityType: "walking", caloriesBurned: 180 }),
    ]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].stepsActivityId).toBe("steps");
  });

  it("does not warn when there is no overlapping activity", () => {
    const warnings = detectStepDoubleCounting([activity({ id: "steps", activityType: "steps", caloriesBurned: 350 })]);
    expect(warnings).toHaveLength(0);
  });

  it("does not warn about an activity already excluded from the total", () => {
    const warnings = detectStepDoubleCounting([
      activity({ id: "steps", activityType: "steps", caloriesBurned: 350, includedInActivityTotal: false }),
      activity({ id: "walk", activityType: "walking", caloriesBurned: 180 }),
    ]);
    expect(warnings).toHaveLength(0);
  });
});

describe("calculateEstimatedTDEE / calculateEnergyBalance", () => {
  // TEST15: calcular balanco energetico
  it("computes TDEE as BMR + activity calories", () => {
    expect(calculateEstimatedTDEE(1770, 1370)).toBe(3140);
  });

  it("computes a deficit when intake is below TDEE, always marked as an estimate", () => {
    const balance = calculateEnergyBalance(3140, 2200);
    expect(balance.balanceKcal).toBe(-940);
    expect(balance.isEstimate).toBe(true);
  });

  it("computes a surplus when intake exceeds TDEE", () => {
    const balance = calculateEnergyBalance(2000, 2500);
    expect(balance.balanceKcal).toBe(500);
  });
});

describe("estimateStepsCalories", () => {
  it("returns a positive, weight-scaled estimate", () => {
    const calories = estimateStepsCalories(8500, 107);
    expect(calories).toBeGreaterThan(0);
    expect(estimateStepsCalories(8500, 214)).toBeCloseTo(calories * 2);
  });

  it("rejects negative step counts", () => {
    expect(() => estimateStepsCalories(-1)).toThrow();
  });
});
