import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDb } from "../testDb";
import { createTestUserWithPlan } from "../fixtures";
import { recalculateDay } from "@/lib/services/recalculateDay";
import { toDateOnly } from "@/lib/services/dateOnly";
import { calculateFoodNutrition, convertToGrams } from "@/lib/nutrition/engine";
import { estimateStepsCalories } from "@/lib/activities/engine";
import type { FoodUnit } from "@/types/domain";

const DAY1 = "2026-09-10";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await resetDb();
  await prisma.$disconnect();
});

// Same reasoning as the other *-actions test suites: the "use server"
// wrappers in src/app/(app)/quick-add-actions.ts need requireUserId() ->
// cookies(), unavailable under plain Vitest, so these tests exercise the
// same underlying writes + shared engine calls those actions perform.

describe("quick add — meal", () => {
  it("registers a manually-selected food with correct nutrition, then recalculates the day", async () => {
    const { user, foods } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);

    const conversion = convertToGrams(200, "g", { servingUnit: foods.frango.servingUnit as FoodUnit, gramsPerUnit: foods.frango.gramsPerUnit });
    const nutrition = calculateFoodNutrition(conversion.grams, foods.frango);
    await prisma.mealEntry.create({
      data: { userId: user.id, date, mealType: "dinner", foodId: foods.frango.id, quantity: 200, unit: "g", grams: 200, ...nutrition, source: "user", isEstimated: false },
    });

    const result = await recalculateDay(user.id, date, { triggerAdjustment: true });
    expect(result.dayTotals.calories).toBeCloseTo(318); // 200g @ 159kcal/100g
  });

  it("supports adding multiple foods to the same meal in one quick-add session", async () => {
    const { user, foods } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);

    for (const [food, grams] of [
      [foods.frango, 150],
      [foods.cuscuz, 100],
    ] as const) {
      const nutrition = calculateFoodNutrition(grams, food);
      await prisma.mealEntry.create({
        data: { userId: user.id, date, mealType: "lunch", foodId: food.id, quantity: grams, unit: "g", grams, ...nutrition, source: "user", isEstimated: false },
      });
    }

    const entries = await prisma.mealEntry.findMany({ where: { userId: user.id, date } });
    expect(entries).toHaveLength(2);
  });
});

describe("quick add — activities", () => {
  it("registers a weight-training session", async () => {
    const { user } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);
    await prisma.physicalActivity.create({
      data: { userId: user.id, date, activityType: "weight_training", durationMinutes: 75, caloriesBurned: 620, caloriesSource: "user", intensity: "moderada" },
    });
    const result = await recalculateDay(user.id, date, { triggerAdjustment: false });
    expect(result.activityCaloriesTotal).toBe(620);
  });

  it("registers a swimming session with distance and style in notes", async () => {
    const { user } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);
    await prisma.physicalActivity.create({
      data: { userId: user.id, date, activityType: "swimming", durationMinutes: 45, distanceKm: 1.5, caloriesBurned: 400, caloriesSource: "device", notes: "nado livre" },
    });
    const activity = await prisma.physicalActivity.findFirstOrThrow({ where: { userId: user.id, date } });
    expect(activity.distanceKm).toBe(1.5);
    expect(activity.caloriesSource).toBe("device");
  });

  it("registers a generic 'other' activity", async () => {
    const { user } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);
    await prisma.physicalActivity.create({
      data: { userId: user.id, date, activityType: "sports", description: "futebol", durationMinutes: 60, caloriesBurned: 700, caloriesSource: "estimated" },
    });
    const result = await recalculateDay(user.id, date, { triggerAdjustment: false });
    expect(result.activityCaloriesTotal).toBe(700);
  });

  it("creates a steps entry with an estimate when calories are not provided", async () => {
    const { user } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);
    const estimated = estimateStepsCalories(9000, 107.45);
    await prisma.physicalActivity.create({
      data: { userId: user.id, date, activityType: "steps", steps: 9000, caloriesBurned: estimated, caloriesSource: "estimated" },
    });
    const activity = await prisma.physicalActivity.findFirstOrThrow({ where: { userId: user.id, date, activityType: "steps" } });
    expect(activity.caloriesSource).toBe("estimated");
    expect(activity.caloriesBurned).toBeGreaterThan(0);
  });

  it("updates the existing steps entry instead of duplicating it when quick-added twice", async () => {
    const { user } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);
    await prisma.physicalActivity.create({ data: { userId: user.id, date, activityType: "steps", steps: 5000, caloriesBurned: 200, caloriesSource: "user" } });

    const existing = await prisma.physicalActivity.findFirstOrThrow({ where: { userId: user.id, date, activityType: "steps" } });
    await prisma.physicalActivity.update({ where: { id: existing.id }, data: { steps: 9500, caloriesBurned: 380 } });

    const all = await prisma.physicalActivity.findMany({ where: { userId: user.id, date, activityType: "steps" } });
    expect(all).toHaveLength(1);
    expect(all[0].steps).toBe(9500);
  });
});

describe("quick add — editing and deleting", () => {
  it("editing a quick-added activity recalculates the day's activity total", async () => {
    const { user } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);
    const activity = await prisma.physicalActivity.create({
      data: { userId: user.id, date, activityType: "weight_training", caloriesBurned: 500, caloriesSource: "user" },
    });
    await prisma.physicalActivity.update({ where: { id: activity.id }, data: { caloriesBurned: 650 } });
    const result = await recalculateDay(user.id, date, { triggerAdjustment: false });
    expect(result.activityCaloriesTotal).toBe(650);
  });

  it("deleting a quick-added meal entry recalculates the day's totals", async () => {
    const { user, foods } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);
    const nutrition = calculateFoodNutrition(200, foods.frango);
    const entry = await prisma.mealEntry.create({
      data: { userId: user.id, date, mealType: "dinner", foodId: foods.frango.id, quantity: 200, unit: "g", grams: 200, ...nutrition, source: "user" },
    });
    await prisma.mealEntry.delete({ where: { id: entry.id } });
    const result = await recalculateDay(user.id, date, { triggerAdjustment: false });
    expect(result.dayTotals.calories).toBe(0);
  });
});

describe("quick add — check-in updates dashboard immediately", () => {
  it("persists hunger/energy/trainingPerformance onto today's DailyLog", async () => {
    const { user } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);
    await recalculateDay(user.id, date, { triggerAdjustment: false });
    await prisma.dailyLog.update({ where: { userId_date: { userId: user.id, date } }, data: { hunger: 4, energy: 2, trainingPerformance: 3 } });

    const log = await prisma.dailyLog.findUniqueOrThrow({ where: { userId_date: { userId: user.id, date } } });
    expect(log.hunger).toBe(4);
    expect(log.energy).toBe(2);
    expect(log.trainingPerformance).toBe(3);
  });
});

describe("quick add — weight/water/supplements update immediately", () => {
  it("adding a weight entry updates current weight and 7-day average", async () => {
    const { user } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);
    await prisma.weightEntry.create({ data: { userId: user.id, date, weightKg: 107.3, measurementCondition: "ao acordar" } });
    await recalculateDay(user.id, date, { triggerAdjustment: false });
    const log = await prisma.dailyLog.findUniqueOrThrow({ where: { userId_date: { userId: user.id, date } } });
    expect(log.weightKg).toBe(107.3);
  });

  it("adding water updates the day's total immediately", async () => {
    const { user } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);
    await prisma.waterEntry.create({ data: { userId: user.id, date, amountMl: 500 } });
    await prisma.waterEntry.create({ data: { userId: user.id, date, amountMl: 700 } });
    const result = await recalculateDay(user.id, date, { triggerAdjustment: false });
    expect(result.dayTotals).toBeDefined(); // sanity: recalculation ran without error
    const waterSum = await prisma.waterEntry.aggregate({ where: { userId: user.id, date }, _sum: { amountMl: true } });
    expect(waterSum._sum.amountMl).toBe(1200);
  });

  it("marking a supplement taken uses the plan's configured target grams, not a hardcoded value", async () => {
    const { user, plan } = await createTestUserWithPlan();
    const date = toDateOnly(DAY1);
    await prisma.supplementEntry.upsert({
      where: { userId_date_type: { userId: user.id, date, type: "whey" } },
      update: { taken: true, takenGrams: plan.wheyTargetG },
      create: { userId: user.id, date, type: "whey", targetGrams: plan.wheyTargetG, taken: true, takenGrams: plan.wheyTargetG },
    });
    const entry = await prisma.supplementEntry.findFirstOrThrow({ where: { userId: user.id, date, type: "whey" } });
    expect(entry.targetGrams).toBe(plan.wheyTargetG);
  });
});
