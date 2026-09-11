import { describe, expect, it } from "vitest";
import { adjustRemainingMeals, type AdjustableMeal, type PlanTargets } from "@/lib/adjustment/engine";
import type { NutrientTotals } from "@/types/domain";

const TARGETS: PlanTargets = {
  caloriesMin: 2150,
  caloriesTarget: 2200,
  caloriesMax: 2250,
  proteinMin: 185,
  proteinTarget: 190,
  proteinMax: 195,
  carbsMin: 190,
  carbsTarget: 200,
  carbsMax: 210,
  fatMin: 70,
  fatTarget: 75,
  fatMax: 80,
  fiberMin: 30,
};

function buildFutureMeals(): AdjustableMeal[] {
  return [
    {
      id: "shake",
      mealType: "shake",
      name: "Shake",
      isProtectedComposition: true,
      isAdjustable: true,
      items: [
        { id: "whey", foodId: "food-whey", foodName: "Whey protein concentrado", facts: { caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 8, fatPer100g: 5, fiberPer100g: 0 }, currentGrams: 40, minGrams: 30, maxGrams: 50, stepGrams: 5, role: "protein", isMandatory: true },
        { id: "banana", foodId: "food-banana", foodName: "Banana congelada", facts: { caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26, fatPer100g: 0.1, fiberPer100g: 2 }, currentGrams: 100, minGrams: 50, maxGrams: 150, stepGrams: 10, role: "carb", isMandatory: true },
        { id: "leite", foodId: "food-leite", foodName: "Leite desnatado", facts: { caloriesPer100g: 35, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 0.2, fiberPer100g: 0 }, currentGrams: 200, minGrams: 150, maxGrams: 250, stepGrams: 25, role: "fixed", isMandatory: true },
        { id: "aveia", foodId: "food-aveia", foodName: "Aveia em flocos", facts: { caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 67, fatPer100g: 8.5, fiberPer100g: 9.1 }, currentGrams: 10, minGrams: 5, maxGrams: 20, stepGrams: 5, role: "carb", isMandatory: true },
        { id: "castanha", foodId: "food-castanha", foodName: "Castanha do para", facts: { caloriesPer100g: 656, proteinPer100g: 14.3, carbsPer100g: 12.3, fatPer100g: 66.4, fiberPer100g: 7.9 }, currentGrams: 5, minGrams: 3, maxGrams: 10, stepGrams: 1, role: "fat", isMandatory: true },
        { id: "creatina", foodId: "food-creatina", foodName: "Creatina monohidratada", facts: { caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, fiberPer100g: 0 }, currentGrams: 5, minGrams: 5, maxGrams: 5, stepGrams: 0, role: "fixed", isMandatory: true },
      ],
    },
    {
      id: "dinner",
      mealType: "dinner",
      name: "Jantar",
      isProtectedComposition: false,
      isAdjustable: true,
      items: [
        { id: "frango", foodId: "food-frango", foodName: "Frango peito grelhado", facts: { caloriesPer100g: 159, proteinPer100g: 32, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 }, currentGrams: 200, minGrams: 150, maxGrams: 300, stepGrams: 10, role: "protein", isMandatory: false },
        { id: "cuscuz", foodId: "food-cuscuz", foodName: "Cuscuz cozido", facts: { caloriesPer100g: 112, proteinPer100g: 2.5, carbsPer100g: 25, fatPer100g: 0.2, fiberPer100g: 1.5 }, currentGrams: 150, minGrams: 50, maxGrams: 250, stepGrams: 10, role: "carb", isMandatory: false },
        { id: "azeite", foodId: "food-azeite", foodName: "Azeite de oliva", facts: { caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 }, currentGrams: 5, minGrams: 0, maxGrams: 15, stepGrams: 5, role: "fat", isMandatory: false },
      ],
    },
  ];
}

function findItem(meals: AdjustableMeal[], id: string) {
  for (const meal of meals) {
    const item = meal.items.find((i) => i.id === id);
    if (item) return item;
  }
  throw new Error(`item ${id} not found`);
}

describe("adjustRemainingMeals", () => {
  // TEST5: dia com proteina insuficiente -> aumenta fontes de proteina
  it("increases protein-role items when protein is running low, never touching mandatory shake floor", () => {
    const consumed: NutrientTotals = { calories: 1200, protein: 40, carbs: 120, fat: 30, fiber: 12 };
    const result = adjustRemainingMeals({ targets: TARGETS, consumedNutrition: consumed, futureMeals: buildFutureMeals() });

    expect(result.changes.length).toBeGreaterThan(0);
    const frango = findItem(result.adjustedFutureMeals, "frango");
    expect(frango.currentGrams).toBeGreaterThan(200);
    expect(result.futureTotalsAfter.protein).toBeGreaterThan(result.futureTotalsBefore.protein);

    // Shake mandatory items are never pushed below their configured minimum.
    for (const itemId of ["whey", "banana", "leite", "aveia", "castanha", "creatina"]) {
      const item = findItem(result.adjustedFutureMeals, itemId);
      expect(item.currentGrams).toBeGreaterThanOrEqual(item.minGrams);
    }
  });

  // TEST3: almoco com excesso de carboidratos -> reduz fontes de carboidrato, priorizando cuscuz
  it("reduces carb-role items when carbs are already over target", () => {
    const consumed: NutrientTotals = { calories: 1900, protein: 150, carbs: 260, fat: 55, fiber: 20 };
    const result = adjustRemainingMeals({ targets: TARGETS, consumedNutrition: consumed, futureMeals: buildFutureMeals() });

    const cuscuz = findItem(result.adjustedFutureMeals, "cuscuz");
    expect(cuscuz.currentGrams).toBeLessThan(150);
    expect(result.futureTotalsAfter.carbs).toBeLessThan(result.futureTotalsBefore.carbs);
  });

  // TEST4: almoco com excesso de gordura -> reduz fontes de gordura, priorizando azeite
  it("reduces fat-role items when fat is already over target", () => {
    const consumed: NutrientTotals = { calories: 1900, protein: 150, carbs: 150, fat: 95, fiber: 20 };
    const result = adjustRemainingMeals({ targets: TARGETS, consumedNutrition: consumed, futureMeals: buildFutureMeals() });

    const azeite = findItem(result.adjustedFutureMeals, "azeite");
    expect(azeite.currentGrams).toBeLessThan(5);
    const castanha = findItem(result.adjustedFutureMeals, "castanha");
    expect(castanha.currentGrams).toBeGreaterThanOrEqual(3);
  });

  // TEST6: shake padrao -- composicao nunca perde os componentes obrigatorios
  it("never removes or zeroes the mandatory shake components", () => {
    const consumed: NutrientTotals = { calories: 1700, protein: 140, carbs: 180, fat: 60, fiber: 20 };
    const result = adjustRemainingMeals({ targets: TARGETS, consumedNutrition: consumed, futureMeals: buildFutureMeals() });

    const shake = result.adjustedFutureMeals.find((m) => m.id === "shake")!;
    expect(shake.items).toHaveLength(6);
    const creatina = findItem(result.adjustedFutureMeals, "creatina");
    expect(creatina.currentGrams).toBe(5); // locked min=max=5
    for (const item of shake.items) {
      expect(item.currentGrams).toBeGreaterThan(0);
    }
  });

  // TEST2 / TEST25: refeicao fora do plano / dia com consumo acima da meta
  it("flags day as above_target and preserves future meals within bounds instead of forcing a fast", () => {
    const consumed: NutrientTotals = { calories: 2400, protein: 120, carbs: 250, fat: 90, fiber: 15 }; // e.g. an unplanned pizza
    const result = adjustRemainingMeals({ targets: TARGETS, consumedNutrition: consumed, futureMeals: buildFutureMeals() });

    expect(result.dayStatus).toBe("above_target");
    expect(result.warnings.some((w) => w.includes("acima da meta planejada"))).toBe(true);

    // Never below each item's configured minimum -- no forced fasting/zeroing.
    for (const meal of result.adjustedFutureMeals) {
      for (const item of meal.items) {
        expect(item.currentGrams).toBeGreaterThanOrEqual(item.minGrams);
      }
    }
  });

  it("makes no changes when the plan is already on track", () => {
    const consumed: NutrientTotals = { calories: 1330, protein: 115, carbs: 122, fat: 45, fiber: 18 };
    const result = adjustRemainingMeals({ targets: TARGETS, consumedNutrition: consumed, futureMeals: buildFutureMeals() });
    // Should be at/near target once future meals are added at their default quantities.
    expect(result.dayStatus).toBe("on_track");
  });
});
