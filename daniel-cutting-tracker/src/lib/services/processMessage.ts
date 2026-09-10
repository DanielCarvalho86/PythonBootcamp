import { prisma } from "@/lib/database/prisma";
import { parseUserMessage } from "@/lib/ai";
import { matchFood } from "@/lib/nutrition/foodMatcher";
import { calculateFoodNutrition, convertToGrams } from "@/lib/nutrition/engine";
import { estimateStepsCalories } from "@/lib/activities/engine";
import { recalculateDay, type RecalculateDayResult } from "@/lib/services/recalculateDay";
import { toDateOnly, todayDateOnlyString } from "@/lib/services/dateOnly";
import type { FoodUnit, ParsedMessage } from "@/types/domain";

export interface ProcessMessageResult {
  date: string;
  createdMealEntryIds: string[];
  createdActivityIds: string[];
  weightLogged: boolean;
  waterLoggedMl: number | null;
  unresolvedFoodItems: string[];
  needsClarification?: string;
  recalculation: RecalculateDayResult;
}

/**
 * The "unified inbox" pipeline described in spec section 57 (STEP 1-10):
 * parse -> classify -> extract -> validate -> save -> calculate ->
 * update dashboard -> recalc future meals -> recalc energy -> return.
 *
 * Every arithmetic step delegates to the deterministic engines
 * (nutrition/activities/adjustment) — this function only orchestrates I/O.
 */
export async function processUserMessage(
  userId: string,
  message: string,
  todayOverride?: string,
): Promise<ProcessMessageResult> {
  const today = todayOverride ?? todayDateOnlyString();
  const parsed: ParsedMessage = await parseUserMessage(message, today);
  const date = toDateOnly(parsed.date || today);

  const foods = await prisma.food.findMany();

  const createdMealEntryIds: string[] = [];
  const unresolvedFoodItems: string[] = [];

  for (const meal of parsed.meals) {
    for (const item of meal.items) {
      const match = matchFood(item.food, foods);

      if (!match) {
        // Unknown food (spec section 29): register what we can, flagged
        // as an estimate, and surface it so the user can add the food or
        // clarify rather than silently dropping the entry.
        const grams = item.unit === "g" || item.unit === "ml" ? item.quantity : 0;
        const entry = await prisma.mealEntry.create({
          data: {
            userId,
            date,
            mealType: meal.mealType,
            freeTextDescription: item.food,
            quantity: item.quantity,
            unit: item.unit,
            grams,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            source: "ai_parser",
            isEstimated: true,
            notes: "Alimento nao encontrado no banco de dados. Valores nutricionais nao calculados.",
          },
        });
        createdMealEntryIds.push(entry.id);
        unresolvedFoodItems.push(item.food);
        continue;
      }

      const foodRow = foods.find((f) => f.id === match.food.id)!;
      let grams: number;
      let isEstimated = !match.isExactMatch;
      try {
        const conversion = convertToGrams(item.quantity, item.unit, {
          servingUnit: foodRow.servingUnit as FoodUnit,
          gramsPerUnit: foodRow.gramsPerUnit,
        });
        grams = conversion.grams;
        isEstimated = isEstimated || conversion.isEstimated;
      } catch {
        grams = item.unit === "g" || item.unit === "ml" ? item.quantity : 0;
        isEstimated = true;
      }

      const nutrition = calculateFoodNutrition(grams, {
        caloriesPer100g: foodRow.caloriesPer100g,
        proteinPer100g: foodRow.proteinPer100g,
        carbsPer100g: foodRow.carbsPer100g,
        fatPer100g: foodRow.fatPer100g,
        fiberPer100g: foodRow.fiberPer100g,
      });

      const entry = await prisma.mealEntry.create({
        data: {
          userId,
          date,
          mealType: meal.mealType,
          foodId: foodRow.id,
          quantity: item.quantity,
          unit: item.unit,
          grams,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          fiber: nutrition.fiber,
          source: "ai_parser",
          isEstimated,
        },
      });
      createdMealEntryIds.push(entry.id);
    }
  }

  const createdActivityIds: string[] = [];
  for (const activity of parsed.activities) {
    const created = await prisma.physicalActivity.create({
      data: {
        userId,
        date,
        activityType: activity.activityType,
        description: activity.description,
        durationMinutes: activity.durationMinutes,
        caloriesBurned: activity.caloriesBurned ?? 0,
        caloriesSource: activity.caloriesBurned !== undefined ? activity.caloriesSource : "estimated",
        distanceKm: activity.distanceKm,
        intensity: activity.intensity,
      },
    });
    createdActivityIds.push(created.id);
  }

  if (parsed.steps !== undefined) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const caloriesBurned =
      parsed.stepsCalories ?? estimateStepsCalories(parsed.steps, profile?.referenceWeightKg ?? 107);
    const existingStepsEntry = await prisma.physicalActivity.findFirst({
      where: { userId, date, activityType: "steps" },
    });
    if (existingStepsEntry) {
      const updated = await prisma.physicalActivity.update({
        where: { id: existingStepsEntry.id },
        data: {
          steps: parsed.steps,
          caloriesBurned,
          caloriesSource: parsed.stepsCalories !== undefined ? "user" : "estimated",
        },
      });
      createdActivityIds.push(updated.id);
    } else {
      const created = await prisma.physicalActivity.create({
        data: {
          userId,
          date,
          activityType: "steps",
          steps: parsed.steps,
          caloriesBurned,
          caloriesSource: parsed.stepsCalories !== undefined ? "user" : "estimated",
        },
      });
      createdActivityIds.push(created.id);
    }
  }

  let weightLogged = false;
  if (parsed.weight) {
    await prisma.weightEntry.create({
      data: {
        userId,
        date,
        weightKg: parsed.weight.weightKg,
        measurementCondition: parsed.weight.measurementCondition,
      },
    });
    weightLogged = true;
  }

  let waterLoggedMl: number | null = null;
  if (parsed.waterMl !== undefined) {
    await prisma.waterEntry.create({ data: { userId, date, amountMl: parsed.waterMl } });
    waterLoggedMl = parsed.waterMl;
  }

  const mealsWereLogged = parsed.meals.length > 0;
  const recalculation = await recalculateDay(userId, date, {
    triggerAdjustment: mealsWereLogged,
    adjustmentReason: mealsWereLogged ? "Nova refeicao registrada via mensagem" : undefined,
    triggerMealEntryId: createdMealEntryIds[createdMealEntryIds.length - 1],
  });

  return {
    date: parsed.date || today,
    createdMealEntryIds,
    createdActivityIds,
    weightLogged,
    waterLoggedMl,
    unresolvedFoodItems,
    needsClarification: parsed.needsClarification,
    recalculation,
  };
}
