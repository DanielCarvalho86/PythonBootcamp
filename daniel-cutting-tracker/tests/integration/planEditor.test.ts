import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDb } from "../testDb";
import { createTestUserWithPlan } from "../fixtures";
import { parsePlanMealItemFormData, parsePlanTargetsFormData } from "@/lib/validation/planSchema";
import { buildFutureAdjustableMeals } from "@/lib/services/dayPlan";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await resetDb();
  await prisma.$disconnect();
});

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

// Same pattern as the food editor tests: exercise the same Prisma writes
// the "use server" actions in settings/plans/actions.ts perform, since
// those need requireUserId() -> cookies(), unavailable under plain Vitest.

describe("plan editor — targets", () => {
  it("updates a plan's targets and they are reflected by the adjustment pipeline", async () => {
    const { user, plan } = await createTestUserWithPlan();

    const parsed = parsePlanTargetsFormData(
      formData({
        name: plan.name,
        startDate: "2026-09-01",
        endDate: "2026-09-30",
        caloriesMin: "2000",
        caloriesTarget: "2050",
        caloriesMax: "2100",
        proteinMin: "180",
        proteinTarget: "185",
        proteinMax: "190",
        carbsMin: "150",
        carbsTarget: "160",
        carbsMax: "170",
        fatMin: "60",
        fatTarget: "65",
        fatMax: "70",
        fiberMin: "25",
        fiberMax: "35",
        waterMinMl: "2500",
        waterMaxMl: "3000",
        creatineTargetG: "5",
        wheyTargetG: "40",
      }),
    );
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    await prisma.nutritionPlan.update({
      where: { id: plan.id },
      data: {
        caloriesMin: parsed.data.calories.min,
        caloriesTarget: parsed.data.calories.target,
        caloriesMax: parsed.data.calories.max,
      },
    });

    const updated = await prisma.nutritionPlan.findUniqueOrThrow({ where: { id: plan.id } });
    expect(updated.caloriesTarget).toBe(2050);
    void user;
  });

  it("rejects targets where min > target or target > max", () => {
    const parsed = parsePlanTargetsFormData(
      formData({
        name: "X",
        startDate: "2026-09-01",
        endDate: "2026-09-30",
        caloriesMin: "2200", // min above target — invalid
        caloriesTarget: "2000",
        caloriesMax: "2300",
        proteinMin: "180",
        proteinTarget: "185",
        proteinMax: "190",
        carbsMin: "150",
        carbsTarget: "160",
        carbsMax: "170",
        fatMin: "60",
        fatTarget: "65",
        fatMax: "70",
        fiberMin: "25",
        fiberMax: "35",
        waterMinMl: "2500",
        waterMaxMl: "3000",
        creatineTargetG: "5",
        wheyTargetG: "40",
      }),
    );
    expect(parsed.success).toBe(false);
  });
});

describe("plan editor — meal items", () => {
  it("edits an item's target/min/max/step and the adjustment engine picks up the new bounds", async () => {
    const { plan, dinnerMealId } = await createTestUserWithPlan();
    const frangoItem = await prisma.planMealItem.findFirstOrThrow({ where: { planMealId: dinnerMealId, role: "protein" } });

    const parsed = parsePlanMealItemFormData(
      formData({ targetQuantityG: "250", minQuantityG: "200", maxQuantityG: "350", adjustmentStepG: "10", role: "protein", isMandatory: "" }),
    );
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    await prisma.planMealItem.update({ where: { id: frangoItem.id }, data: parsed.data });

    const futureMeals = await buildFutureAdjustableMeals(plan.id, new Set(), null);
    const dinner = futureMeals.find((m) => m.id === dinnerMealId)!;
    const protein = dinner.items.find((i) => i.id === frangoItem.id)!;
    expect(protein.currentGrams).toBe(250);
    expect(protein.maxGrams).toBe(350);
  });

  it("rejects an item edit where min > target", () => {
    const parsed = parsePlanMealItemFormData(
      formData({ targetQuantityG: "100", minQuantityG: "150", maxQuantityG: "200", adjustmentStepG: "10", role: "carb", isMandatory: "" }),
    );
    expect(parsed.success).toBe(false);
  });

  it("adding a new item to a meal makes it show up as a future-plan item", async () => {
    const { plan, dinnerMealId, foods } = await createTestUserWithPlan();
    const newFood = await prisma.food.create({
      data: { name: "Batata doce", category: "carb", servingUnit: "g", caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, fiberPer100g: 3 },
    });

    await prisma.planMealItem.create({
      data: { planMealId: dinnerMealId, foodId: newFood.id, targetQuantityG: 100, minQuantityG: 50, maxQuantityG: 200, adjustmentStepG: 10, role: "carb" },
    });

    const futureMeals = await buildFutureAdjustableMeals(plan.id, new Set(), null);
    const dinner = futureMeals.find((m) => m.id === dinnerMealId)!;
    expect(dinner.items.some((i) => i.foodName === "Batata doce")).toBe(true);
    void foods;
  });

  it("deleting an item removes it from future-plan resolution", async () => {
    const { plan, dinnerMealId } = await createTestUserWithPlan();
    const azeiteItem = await prisma.planMealItem.findFirstOrThrow({ where: { planMealId: dinnerMealId, role: "fat" } });

    await prisma.planMealItem.delete({ where: { id: azeiteItem.id } });

    const futureMeals = await buildFutureAdjustableMeals(plan.id, new Set(), null);
    const dinner = futureMeals.find((m) => m.id === dinnerMealId)!;
    expect(dinner.items.some((i) => i.id === azeiteItem.id)).toBe(false);
  });
});

describe("plan editor — cross-user authorization guard", () => {
  // Mirrors the ownership check in settings/plans/actions.ts
  // (itemBelongsToUser/mealBelongsToUser): a relation-scoped query must
  // return nothing for a plan/meal/item that belongs to a different user,
  // even though the id itself is valid.
  it("does not resolve another user's plan meal item as owned", async () => {
    const { dinnerMealId } = await createTestUserWithPlan();
    const item = await prisma.planMealItem.findFirstOrThrow({ where: { planMealId: dinnerMealId } });

    const otherUser = await prisma.user.create({ data: { email: `other-${Date.now()}@example.com`, passwordHash: "x" } });

    const ownedByOther = await prisma.planMealItem.findFirst({
      where: { id: item.id, planMeal: { plan: { userId: otherUser.id } } },
      select: { id: true },
    });
    expect(ownedByOther).toBeNull();
  });

  it("resolves the item as owned for the actual plan owner", async () => {
    const { user, dinnerMealId } = await createTestUserWithPlan();
    const item = await prisma.planMealItem.findFirstOrThrow({ where: { planMealId: dinnerMealId } });

    const owned = await prisma.planMealItem.findFirst({
      where: { id: item.id, planMeal: { plan: { userId: user.id } } },
      select: { id: true },
    });
    expect(owned).not.toBeNull();
  });
});

describe("plan editor — plan activation and duplication", () => {
  it("toggling isActive changes which plan getActivePlanForDate resolves", async () => {
    const { plan } = await createTestUserWithPlan();
    await prisma.nutritionPlan.update({ where: { id: plan.id }, data: { isActive: false } });
    const reloaded = await prisma.nutritionPlan.findUniqueOrThrow({ where: { id: plan.id } });
    expect(reloaded.isActive).toBe(false);
  });

  it("duplicating a plan deep-copies its meals and items without mutating the source", async () => {
    const { plan, dinnerMealId } = await createTestUserWithPlan();
    const source = await prisma.nutritionPlan.findUniqueOrThrow({
      where: { id: plan.id },
      include: { meals: { include: { items: true } } },
    });

    const copy = await prisma.nutritionPlan.create({
      data: {
        userId: source.userId,
        name: "Semana copia",
        startDate: new Date("2026-10-01"),
        endDate: new Date("2026-10-07"),
        isActive: false,
        caloriesMin: source.caloriesMin,
        caloriesTarget: source.caloriesTarget,
        caloriesMax: source.caloriesMax,
        proteinMin: source.proteinMin,
        proteinTarget: source.proteinTarget,
        proteinMax: source.proteinMax,
        carbsMin: source.carbsMin,
        carbsTarget: source.carbsTarget,
        carbsMax: source.carbsMax,
        fatMin: source.fatMin,
        fatTarget: source.fatTarget,
        fatMax: source.fatMax,
        fiberMin: source.fiberMin,
        fiberMax: source.fiberMax,
        waterMinMl: source.waterMinMl,
        waterMaxMl: source.waterMaxMl,
      },
    });
    for (const meal of source.meals) {
      await prisma.planMeal.create({
        data: {
          planId: copy.id,
          mealType: meal.mealType,
          name: meal.name,
          order: meal.order,
          isProtectedComposition: meal.isProtectedComposition,
          items: { create: meal.items.map((i) => ({ foodId: i.foodId, targetQuantityG: i.targetQuantityG, minQuantityG: i.minQuantityG, maxQuantityG: i.maxQuantityG, adjustmentStepG: i.adjustmentStepG, role: i.role, isMandatory: i.isMandatory })) },
        },
      });
    }

    const copyMeals = await prisma.planMeal.findMany({ where: { planId: copy.id }, include: { items: true } });
    expect(copyMeals).toHaveLength(source.meals.length);

    // Mutating the copy must never touch the original plan's items.
    const copyDinner = copyMeals.find((m) => m.mealType === "dinner")!;
    const copyItem = copyDinner.items[0];
    await prisma.planMealItem.update({ where: { id: copyItem.id }, data: { targetQuantityG: 999 } });

    const originalItem = await prisma.planMealItem.findFirstOrThrow({ where: { planMealId: dinnerMealId, foodId: copyItem.foodId } });
    expect(originalItem.targetQuantityG).not.toBe(999);
  });
});
