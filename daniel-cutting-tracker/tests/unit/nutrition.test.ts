import { describe, expect, it } from "vitest";
import {
  calculateDailyNutrition,
  calculateFoodNutrition,
  calculateMealNutrition,
  calculateRemainingTargets,
  convertToGrams,
} from "@/lib/nutrition/engine";

const CHICKEN = { caloriesPer100g: 159, proteinPer100g: 32, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 };
const RICE = { caloriesPer100g: 128, proteinPer100g: 2.5, carbsPer100g: 28, fatPer100g: 0.2, fiberPer100g: 1.6 };

describe("calculateFoodNutrition", () => {
  // TEST19: quantidade em gramas
  it("scales nutrition linearly with grams", () => {
    const result = calculateFoodNutrition(200, CHICKEN);
    expect(result.calories).toBeCloseTo(318);
    expect(result.protein).toBeCloseTo(64);
    expect(result.fat).toBeCloseTo(5);
  });

  it("returns zero nutrition for zero grams", () => {
    const result = calculateFoodNutrition(0, CHICKEN);
    expect(result).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  });

  it("rejects negative amounts", () => {
    expect(() => calculateFoodNutrition(-10, CHICKEN)).toThrow();
  });
});

describe("convertToGrams", () => {
  // TEST19: unit already in grams
  it("passes grams through unchanged", () => {
    const { grams, isEstimated } = convertToGrams(200, "g", { servingUnit: "g", gramsPerUnit: null });
    expect(grams).toBe(200);
    expect(isEstimated).toBe(false);
  });

  // TEST20: quantidade em unidade (e.g. 2 ovos)
  it("converts a unit-based quantity using the food's gramsPerUnit", () => {
    const { grams, isEstimated } = convertToGrams(2, "unit", { servingUnit: "unit", gramsPerUnit: 50 });
    expect(grams).toBe(100);
    expect(isEstimated).toBe(false);
  });

  it("flags the conversion as estimated when the unit doesn't match the food's default serving unit", () => {
    const { isEstimated } = convertToGrams(1, "slice", { servingUnit: "unit", gramsPerUnit: 50 });
    expect(isEstimated).toBe(true);
  });

  it("throws when there is no known gram conversion", () => {
    expect(() => convertToGrams(1, "unit", { servingUnit: "unit", gramsPerUnit: null })).toThrow();
  });
});

describe("calculateMealNutrition / calculateDailyNutrition", () => {
  // TEST1: registrar cafe da manha normal
  it("sums multiple food items into meal totals", () => {
    const meal = calculateMealNutrition([
      { grams: 200, facts: CHICKEN },
      { grams: 150, facts: RICE },
    ]);
    expect(meal.calories).toBeCloseTo(318 + 192);
    expect(meal.protein).toBeCloseTo(64 + 3.75);
  });

  it("sums multiple meals into a daily total", () => {
    const breakfast = calculateMealNutrition([{ grams: 100, facts: CHICKEN }]);
    const lunch = calculateMealNutrition([{ grams: 150, facts: RICE }]);
    const daily = calculateDailyNutrition([breakfast, lunch]);
    expect(daily.calories).toBeCloseTo(159 + 192);
  });
});

describe("calculateRemainingTargets", () => {
  it("returns positive remainders when under target", () => {
    const remaining = calculateRemainingTargets(
      { caloriesTarget: 2200, proteinTarget: 190, carbsTarget: 200, fatTarget: 75, fiberMin: 30 },
      { calories: 800, protein: 60, carbs: 80, fat: 20, fiber: 10 },
    );
    expect(remaining.calories).toBe(1400);
    expect(remaining.protein).toBe(130);
  });

  // TEST25: dia com consumo acima da meta -> negative remainder, never clamped to zero
  it("returns negative remainders (not clamped) when already over target", () => {
    const remaining = calculateRemainingTargets(
      { caloriesTarget: 2200, proteinTarget: 190, carbsTarget: 200, fatTarget: 75, fiberMin: 30 },
      { calories: 2800, protein: 100, carbs: 300, fat: 120, fiber: 10 },
    );
    expect(remaining.calories).toBe(-600);
    expect(remaining.carbs).toBe(-100);
  });
});
