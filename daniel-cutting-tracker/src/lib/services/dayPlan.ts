import { prisma } from "@/lib/database/prisma";
import type { AdjustableMeal, PlanTargets } from "@/lib/adjustment/engine";
import type { FoodRole, MealType } from "@/types/domain";

/**
 * Loads the plan active for a given date and builds the "future meals"
 * input for the adjustment engine: every plan meal whose mealType has no
 * logged MealEntry yet today. Already-consumed meals are excluded here —
 * structurally guaranteeing the adjustment engine never touches them
 * (spec section 22: "nunca modificar refeições já consumidas").
 *
 * Because a PlanMeal/PlanMealItem row is shared across the whole plan
 * period (e.g. all 7 days of "Semana 3"), this never mutates
 * targetQuantityG directly — today's resized quantities are looked up
 * from the most recent AdjustmentLog for the date instead, and applied on
 * top of the template's original quantities. That keeps the plan template
 * reusable for every other day in the period.
 */

export async function getActivePlanForDate(userId: string, date: Date) {
  return prisma.nutritionPlan.findFirst({
    where: {
      userId,
      isActive: true,
      startDate: { lte: date },
      endDate: { gte: date },
    },
    orderBy: { startDate: "desc" },
  });
}

export function planToTargets(plan: {
  caloriesMin: number;
  caloriesTarget: number;
  caloriesMax: number;
  proteinMin: number;
  proteinTarget: number;
  proteinMax: number;
  carbsMin: number;
  carbsTarget: number;
  carbsMax: number;
  fatMin: number;
  fatTarget: number;
  fatMax: number;
  fiberMin: number;
}): PlanTargets {
  return {
    caloriesMin: plan.caloriesMin,
    caloriesTarget: plan.caloriesTarget,
    caloriesMax: plan.caloriesMax,
    proteinMin: plan.proteinMin,
    proteinTarget: plan.proteinTarget,
    proteinMax: plan.proteinMax,
    carbsMin: plan.carbsMin,
    carbsTarget: plan.carbsTarget,
    carbsMax: plan.carbsMax,
    fatMin: plan.fatMin,
    fatTarget: plan.fatTarget,
    fatMax: plan.fatMax,
    fiberMin: plan.fiberMin,
  };
}

export async function getConsumedMealTypesForDate(userId: string, date: Date): Promise<Set<MealType>> {
  const entries = await prisma.mealEntry.findMany({
    where: { userId, date },
    select: { mealType: true },
    distinct: ["mealType"],
  });
  return new Set(entries.map((e) => e.mealType as MealType));
}

export async function getLatestAdjustmentForDate(userId: string, date: Date) {
  return prisma.adjustmentLog.findFirst({
    where: { userId, date },
    orderBy: { createdAt: "desc" },
  });
}

interface AdjustedPlanSnapshot {
  meals: {
    mealId: string;
    items: { itemId: string; grams: number }[];
  }[];
}

export async function buildFutureAdjustableMeals(
  planId: string,
  consumedMealTypes: Set<MealType>,
  latestAdjustment: { adjustedPlanJson: string } | null,
): Promise<AdjustableMeal[]> {
  const planMeals = await prisma.planMeal.findMany({
    where: { planId },
    orderBy: { order: "asc" },
    include: { items: { include: { food: true } } },
  });

  let overrideByItemId = new Map<string, number>();
  if (latestAdjustment) {
    try {
      const snapshot = JSON.parse(latestAdjustment.adjustedPlanJson) as AdjustedPlanSnapshot;
      for (const meal of snapshot.meals) {
        for (const item of meal.items) {
          overrideByItemId.set(item.itemId, item.grams);
        }
      }
    } catch {
      overrideByItemId = new Map();
    }
  }

  return planMeals
    .filter((meal) => !consumedMealTypes.has(meal.mealType as MealType))
    .map((meal) => ({
      id: meal.id,
      mealType: meal.mealType as MealType,
      name: meal.name,
      isProtectedComposition: meal.isProtectedComposition,
      isAdjustable: meal.isAdjustable,
      items: meal.items.map((item) => ({
        id: item.id,
        foodId: item.foodId,
        foodName: item.food.name,
        facts: {
          caloriesPer100g: item.food.caloriesPer100g,
          proteinPer100g: item.food.proteinPer100g,
          carbsPer100g: item.food.carbsPer100g,
          fatPer100g: item.food.fatPer100g,
          fiberPer100g: item.food.fiberPer100g,
        },
        currentGrams: overrideByItemId.get(item.id) ?? item.targetQuantityG,
        minGrams: item.minQuantityG,
        maxGrams: item.maxQuantityG,
        stepGrams: item.adjustmentStepG,
        role: item.role as FoodRole,
        isMandatory: item.isMandatory,
      })),
    }));
}

export function snapshotMeals(meals: AdjustableMeal[]): AdjustedPlanSnapshot {
  return {
    meals: meals.map((m) => ({
      mealId: m.id,
      items: m.items.map((i) => ({ itemId: i.id, grams: i.currentGrams })),
    })),
  };
}
