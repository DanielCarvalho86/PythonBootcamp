import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDb } from "../testDb";
import { createTestUserWithPlan } from "../fixtures";
import { processUserMessage } from "@/lib/services/processMessage";
import { recalculateDay } from "@/lib/services/recalculateDay";
import { toDateOnly } from "@/lib/services/dateOnly";

const DAY1 = "2026-09-10";
const DAY2 = "2026-09-11";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await resetDb();
  await prisma.$disconnect();
});

describe("processUserMessage — end-to-end registration pipeline", () => {
  // TEST1: registrar cafe da manha normal
  it("registers a simple meal, matches the food, and computes nutrition deterministically", async () => {
    const { user } = await createTestUserWithPlan();
    const result = await processUserMessage(user.id, "Comi 2 ovos.", DAY1);

    expect(result.createdMealEntryIds).toHaveLength(1);
    const entry = await prisma.mealEntry.findUniqueOrThrow({ where: { id: result.createdMealEntryIds[0] } });
    expect(entry.grams).toBe(100); // 2 units * 50g/unit
    expect(entry.calories).toBeCloseTo(155); // 100g @ 155kcal/100g
    expect(result.recalculation.dayTotals.calories).toBeCloseTo(155);
  });

  // TEST16: alterar uma refeicao e recalcular o restante do dia (shake/jantar ajustados)
  it("triggers the adjustment engine and resizes future plan meals when a meal is logged", async () => {
    const { user } = await createTestUserWithPlan();
    // Log a very protein-light, low-calorie breakfast so the engine has
    // room (and reason) to move future items.
    await processUserMessage(user.id, "Comi 2 ovos.", DAY1);

    const adjustmentLogs = await prisma.adjustmentLog.findMany({ where: { userId: user.id } });
    expect(adjustmentLogs.length).toBeGreaterThan(0);

    // The shared PlanMealItem template must never be mutated by the
    // adjustment engine -- only per-day AdjustmentLog snapshots change.
    const dinnerItems = await prisma.planMealItem.findMany({ where: { planMeal: { mealType: "dinner" } } });
    const frangoTemplate = dinnerItems.find((i) => i.role === "protein")!;
    expect(frangoTemplate.targetQuantityG).toBe(200); // untouched template default
  });

  // TEST17: garantir que refeicoes passadas nunca sejam alteradas automaticamente
  it("never modifies an already-logged meal entry when a later meal triggers recalculation", async () => {
    const { user } = await createTestUserWithPlan();
    const breakfastResult = await processUserMessage(user.id, "Comi 2 ovos.", DAY1);
    const breakfastEntryId = breakfastResult.createdMealEntryIds[0];
    const before = await prisma.mealEntry.findUniqueOrThrow({ where: { id: breakfastEntryId } });

    // A big lunch-equivalent registration that should force heavy
    // adjustments to the *future* dinner/shake -- never to breakfast.
    await processUserMessage(user.id, "Comi 300g de frango peito grelhado.", DAY1);

    const after = await prisma.mealEntry.findUniqueOrThrow({ where: { id: breakfastEntryId } });
    expect(after).toEqual(before);
  });

  // TEST22: novo dia -- registros de um dia nao vazam para outro
  it("keeps each day's totals isolated", async () => {
    const { user } = await createTestUserWithPlan();
    await processUserMessage(user.id, "Comi 2 ovos.", DAY1);
    const day2Result = await processUserMessage(user.id, "Bebi 500ml de agua.", DAY2);

    expect(day2Result.recalculation.dayTotals.calories).toBe(0);

    const day1Log = await prisma.dailyLog.findUnique({ where: { userId_date: { userId: user.id, date: toDateOnly(DAY1) } } });
    const day2Log = await prisma.dailyLog.findUnique({ where: { userId_date: { userId: user.id, date: toDateOnly(DAY2) } } });
    expect(day1Log?.caloriesConsumedKcal).toBeGreaterThan(0);
    expect(day2Log?.caloriesConsumedKcal).toBe(0);
  });

  // TEST21: alimento nao encontrado no banco
  it("registers an unmatched food as an estimate and surfaces it for clarification instead of dropping it", async () => {
    const { user } = await createTestUserWithPlan();
    const result = await processUserMessage(user.id, "Comi 100g de salmao.", DAY1);
    expect(result.unresolvedFoodItems).toContain("salmao");
    const entry = await prisma.mealEntry.findUniqueOrThrow({ where: { id: result.createdMealEntryIds[0] } });
    expect(entry.isEstimated).toBe(true);
    expect(entry.calories).toBe(0);
  });
});

describe("edit / delete / duplicate recalculation", () => {
  // TEST7: editar quantidade de alimento
  it("recalculates day totals after editing a meal entry's quantity", async () => {
    const { user, foods } = await createTestUserWithPlan();
    const entry = await prisma.mealEntry.create({
      data: {
        userId: user.id,
        date: toDateOnly(DAY1),
        mealType: "breakfast",
        foodId: foods.frango.id,
        quantity: 100,
        unit: "g",
        grams: 100,
        calories: 159,
        protein: 32,
        carbs: 0,
        fat: 2.5,
        fiber: 0,
        source: "user",
      },
    });

    await prisma.mealEntry.update({ where: { id: entry.id }, data: { quantity: 200, grams: 200, calories: 318, protein: 64, fat: 5 } });
    const result = await recalculateDay(user.id, toDateOnly(DAY1), { triggerAdjustment: false });
    expect(result.dayTotals.calories).toBeCloseTo(318);
  });

  // TEST8: excluir alimento
  it("recalculates day totals after deleting a meal entry", async () => {
    const { user, foods } = await createTestUserWithPlan();
    const entry = await prisma.mealEntry.create({
      data: {
        userId: user.id,
        date: toDateOnly(DAY1),
        mealType: "breakfast",
        foodId: foods.frango.id,
        quantity: 100,
        unit: "g",
        grams: 100,
        calories: 159,
        protein: 32,
        carbs: 0,
        fat: 2.5,
        fiber: 0,
        source: "user",
      },
    });
    await prisma.mealEntry.delete({ where: { id: entry.id } });
    const result = await recalculateDay(user.id, toDateOnly(DAY1), { triggerAdjustment: false });
    expect(result.dayTotals.calories).toBe(0);
  });

  // TEST23: duplicacao de refeicao
  it("duplicating a meal entry doubles the day's total for that item", async () => {
    const { user, foods } = await createTestUserWithPlan();
    const entry = await prisma.mealEntry.create({
      data: {
        userId: user.id,
        date: toDateOnly(DAY1),
        mealType: "breakfast",
        foodId: foods.frango.id,
        quantity: 100,
        unit: "g",
        grams: 100,
        calories: 159,
        protein: 32,
        carbs: 0,
        fat: 2.5,
        fiber: 0,
        source: "user",
      },
    });
    await prisma.mealEntry.create({ data: { ...entry, id: undefined } });
    const result = await recalculateDay(user.id, toDateOnly(DAY1), { triggerAdjustment: false });
    expect(result.dayTotals.calories).toBeCloseTo(318);
  });

  // TEST24: duplicacao de atividade
  it("duplicating an activity sums both entries into the activity total", async () => {
    const { user } = await createTestUserWithPlan();
    const activity = await prisma.physicalActivity.create({
      data: { userId: user.id, date: toDateOnly(DAY1), activityType: "weight_training", caloriesBurned: 620, durationMinutes: 75 },
    });
    await prisma.physicalActivity.create({ data: { ...activity, id: undefined } });
    const result = await recalculateDay(user.id, toDateOnly(DAY1), { triggerAdjustment: false });
    expect(result.activityCaloriesTotal).toBe(1240);
  });
});
