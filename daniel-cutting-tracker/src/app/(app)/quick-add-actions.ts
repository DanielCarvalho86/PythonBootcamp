"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { requireUserId } from "@/lib/auth";
import { recalculateDay } from "@/lib/services/recalculateDay";
import { toDateOnly } from "@/lib/services/dateOnly";
import { calculateFoodNutrition, convertToGrams } from "@/lib/nutrition/engine";
import { estimateStepsCalories } from "@/lib/activities/engine";
import type { ActivityType, CaloriesSource, FoodUnit, MealType } from "@/types/domain";

export interface QuickAddState {
  error?: string;
}

/**
 * Structured "Quick Add" counterpart to the natural-language inbox
 * (processUserMessage) — same underlying deterministic engines and the
 * same recalculateDay() call, just fed from a form instead of a parsed
 * sentence. Spec: quick add never replaces the NL inbox, it's a second
 * entry point into the exact same pipeline.
 */
export async function addManualMealEntryAction(
  dateStr: string,
  mealType: MealType,
  items: { foodId: string; quantity: number; unit: FoodUnit }[],
): Promise<QuickAddState> {
  const userId = await requireUserId();
  if (items.length === 0) return { error: "Adicione pelo menos um alimento." };

  const date = toDateOnly(dateStr);
  const foods = await prisma.food.findMany({ where: { id: { in: items.map((i) => i.foodId) }, active: true } });

  for (const item of items) {
    const food = foods.find((f) => f.id === item.foodId);
    if (!food) return { error: "Alimento nao encontrado ou desativado." };

    let grams: number;
    try {
      grams = convertToGrams(item.quantity, item.unit, { servingUnit: food.servingUnit as FoodUnit, gramsPerUnit: food.gramsPerUnit }).grams;
    } catch {
      return { error: `Nao foi possivel converter a quantidade de "${food.name}" para gramas.` };
    }

    const nutrition = calculateFoodNutrition(grams, {
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      fiberPer100g: food.fiberPer100g,
    });

    await prisma.mealEntry.create({
      data: {
        userId,
        date,
        mealType,
        foodId: food.id,
        quantity: item.quantity,
        unit: item.unit,
        grams,
        ...nutrition,
        source: "user",
        isEstimated: false,
      },
    });
  }

  await recalculateDay(userId, date, { triggerAdjustment: true, adjustmentReason: "Refeicao registrada via Quick Add" });
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/progress");
  return {};
}

export async function addManualActivityAction(
  dateStr: string,
  activityType: ActivityType,
  fields: {
    description?: string;
    durationMinutes?: number;
    distanceKm?: number;
    caloriesBurned?: number;
    caloriesSource: CaloriesSource;
    intensity?: string;
    notes?: string;
  },
): Promise<QuickAddState> {
  const userId = await requireUserId();
  const date = toDateOnly(dateStr);

  await prisma.physicalActivity.create({
    data: {
      userId,
      date,
      activityType,
      description: fields.description,
      durationMinutes: fields.durationMinutes,
      distanceKm: fields.distanceKm,
      caloriesBurned: fields.caloriesBurned ?? 0,
      caloriesSource: fields.caloriesSource,
      intensity: fields.intensity,
      notes: fields.notes,
    },
  });

  await recalculateDay(userId, date, { triggerAdjustment: false });
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/progress");
  return {};
}

/** Steps get their own action because there's at most one "steps" activity
 * per day — a second quick-add for the same day updates it in place
 * instead of creating a duplicate (mirrors processMessage.ts's parser
 * path, so natural language and Quick Add behave identically). */
export async function addOrUpdateStepsAction(
  dateStr: string,
  steps: number,
  caloriesBurned?: number,
  source: CaloriesSource = "user",
): Promise<QuickAddState> {
  const userId = await requireUserId();
  const date = toDateOnly(dateStr);

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const resolvedCalories = caloriesBurned ?? estimateStepsCalories(steps, profile?.referenceWeightKg ?? 107);
  // A source can only be genuinely "device"/"user" when a real calorie
  // reading was provided; with no reading at all, it's always an estimate
  // regardless of what the form's dropdown says.
  const resolvedSource: CaloriesSource = caloriesBurned !== undefined ? source : "estimated";

  const existing = await prisma.physicalActivity.findFirst({ where: { userId, date, activityType: "steps" } });
  if (existing) {
    await prisma.physicalActivity.update({
      where: { id: existing.id },
      data: { steps, caloriesBurned: resolvedCalories, caloriesSource: resolvedSource },
    });
  } else {
    await prisma.physicalActivity.create({
      data: { userId, date, activityType: "steps", steps, caloriesBurned: resolvedCalories, caloriesSource: resolvedSource },
    });
  }

  await recalculateDay(userId, date, { triggerAdjustment: false });
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/progress");
  return {};
}

export async function setDailyCheckinAction(
  dateStr: string,
  fields: { hunger?: number; energy?: number; trainingPerformance?: number },
): Promise<void> {
  const userId = await requireUserId();
  const date = toDateOnly(dateStr);

  // Ensure a DailyLog row exists with correct computed totals before
  // layering the subjective check-in fields on top of it.
  await recalculateDay(userId, date, { triggerAdjustment: false });
  await prisma.dailyLog.update({
    where: { userId_date: { userId, date } },
    data: {
      hunger: fields.hunger,
      energy: fields.energy,
      trainingPerformance: fields.trainingPerformance,
    },
  });
  revalidatePath("/");
}
