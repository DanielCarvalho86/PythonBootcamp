import type { FoodNutritionFacts, FoodUnit, NutrientTotals } from "@/types/domain";
import { ZERO_NUTRIENTS } from "@/types/domain";

/**
 * All nutrition math lives here, and only here. The AI parser never
 * computes calories/macros — it only extracts food + quantity + unit; this
 * module turns that into numbers deterministically (section 8/40 of the
 * product spec: "Nunca confiar no LLM para aritmética nutricional").
 */

export interface FoodForConversion {
  servingUnit: FoodUnit;
  gramsPerUnit: number | null;
}

/**
 * Converts a quantity expressed in an arbitrary serving unit into grams.
 * Falls back to treating the unit as grams if no conversion is known,
 * flagging the caller (via the returned `isEstimated`) that a standard
 * portion was assumed rather than a measured amount.
 */
export function convertToGrams(
  quantity: number,
  unit: FoodUnit,
  food: FoodForConversion,
): { grams: number; isEstimated: boolean } {
  if (quantity < 0 || !Number.isFinite(quantity)) {
    throw new Error(`Invalid quantity: ${quantity}`);
  }

  if (unit === "g" || unit === "ml") {
    return { grams: quantity, isEstimated: false };
  }

  // Non-mass unit (unit/slice/tbsp/cup): requires a known conversion factor.
  if (food.gramsPerUnit && food.gramsPerUnit > 0) {
    const matchesFoodUnit = food.servingUnit === unit;
    return {
      grams: quantity * food.gramsPerUnit,
      // If the caller's unit doesn't match the food's own default serving
      // unit, we're stretching the conversion factor — mark as estimated.
      isEstimated: !matchesFoodUnit,
    };
  }

  throw new Error(
    `No gram conversion available for unit "${unit}" on this food. Provide gramsPerUnit or log in grams.`,
  );
}

/** Computes the nutrition for a given amount (in grams) of one food. */
export function calculateFoodNutrition(grams: number, facts: FoodNutritionFacts): NutrientTotals {
  if (grams < 0 || !Number.isFinite(grams)) {
    throw new Error(`Invalid gram amount: ${grams}`);
  }
  const ratio = grams / 100;
  return {
    calories: round2(ratio * facts.caloriesPer100g),
    protein: round2(ratio * facts.proteinPer100g),
    carbs: round2(ratio * facts.carbsPer100g),
    fat: round2(ratio * facts.fatPer100g),
    fiber: round2(ratio * facts.fiberPer100g),
  };
}

export interface NutritionLineItem {
  grams: number;
  facts: FoodNutritionFacts;
}

/** Sums nutrition across every food item in a meal. */
export function calculateMealNutrition(items: NutritionLineItem[]): NutrientTotals {
  return items.reduce<NutrientTotals>((total, item) => {
    const n = calculateFoodNutrition(item.grams, item.facts);
    return sumNutrients(total, n);
  }, { ...ZERO_NUTRIENTS });
}

/** Sums nutrition across every meal entry in a day. */
export function calculateDailyNutrition(entries: NutrientTotals[]): NutrientTotals {
  return entries.reduce<NutrientTotals>((total, entry) => sumNutrients(total, entry), {
    ...ZERO_NUTRIENTS,
  });
}

export interface DailyTargets {
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  fiberMin: number;
}

export interface RemainingTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

/**
 * How much of the daily plan target is left after what's already been
 * consumed. Values can go negative when the user is already over target —
 * callers must NOT clamp this to zero, since a negative remainder is what
 * signals `day_status = above_target` (spec section 27).
 */
export function calculateRemainingTargets(
  targets: DailyTargets,
  consumed: NutrientTotals,
): RemainingTargets {
  return {
    calories: round2(targets.caloriesTarget - consumed.calories),
    protein: round2(targets.proteinTarget - consumed.protein),
    carbs: round2(targets.carbsTarget - consumed.carbs),
    fat: round2(targets.fatTarget - consumed.fat),
    fiber: round2(targets.fiberMin - consumed.fiber),
  };
}

export function sumNutrients(a: NutrientTotals, b: NutrientTotals): NutrientTotals {
  return {
    calories: round2(a.calories + b.calories),
    protein: round2(a.protein + b.protein),
    carbs: round2(a.carbs + b.carbs),
    fat: round2(a.fat + b.fat),
    fiber: round2(a.fiber + b.fiber),
  };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
