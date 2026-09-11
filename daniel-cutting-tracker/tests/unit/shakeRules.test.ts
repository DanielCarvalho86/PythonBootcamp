import { describe, expect, it } from "vitest";
import { validateShakeComposition } from "@/lib/adjustment/shakeRules";
import type { AdjustableMeal } from "@/lib/adjustment/engine";

function fullShake(): AdjustableMeal {
  return {
    id: "shake",
    mealType: "shake",
    name: "Shake",
    isProtectedComposition: true,
    isAdjustable: true,
    items: [
      { id: "whey", foodId: "f-whey", foodName: "Whey protein concentrado", facts: { caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 8, fatPer100g: 5, fiberPer100g: 0 }, currentGrams: 40, minGrams: 30, maxGrams: 50, stepGrams: 5, role: "protein", isMandatory: true },
      { id: "banana", foodId: "f-banana", foodName: "Banana congelada", facts: { caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26, fatPer100g: 0.1, fiberPer100g: 2 }, currentGrams: 100, minGrams: 50, maxGrams: 150, stepGrams: 10, role: "carb", isMandatory: true },
      { id: "leite", foodId: "f-leite", foodName: "Leite desnatado", facts: { caloriesPer100g: 35, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 0.2, fiberPer100g: 0 }, currentGrams: 200, minGrams: 150, maxGrams: 250, stepGrams: 25, role: "fixed", isMandatory: true },
      { id: "aveia", foodId: "f-aveia", foodName: "Aveia em flocos", facts: { caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 67, fatPer100g: 8.5, fiberPer100g: 9.1 }, currentGrams: 10, minGrams: 5, maxGrams: 20, stepGrams: 5, role: "carb", isMandatory: true },
      { id: "castanha", foodId: "f-castanha", foodName: "Castanha do para", facts: { caloriesPer100g: 656, proteinPer100g: 14.3, carbsPer100g: 12.3, fatPer100g: 66.4, fiberPer100g: 7.9 }, currentGrams: 5, minGrams: 3, maxGrams: 10, stepGrams: 1, role: "fat", isMandatory: true },
      { id: "creatina", foodId: "f-creatina", foodName: "Creatina monohidratada", facts: { caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, fiberPer100g: 0 }, currentGrams: 5, minGrams: 5, maxGrams: 5, stepGrams: 0, role: "fixed", isMandatory: true },
    ],
  };
}

describe("validateShakeComposition", () => {
  it("passes for the full standard shake composition", () => {
    expect(validateShakeComposition(fullShake())).toEqual({ valid: true, missingComponents: [] });
  });

  // TEST4 (spec continuation #25.4): ajuste de shake nao pode remover whey
  it("flags a missing whey component", () => {
    const shake = fullShake();
    shake.items = shake.items.filter((i) => i.id !== "whey");
    expect(validateShakeComposition(shake).missingComponents).toContain("Whey");
  });

  // #25.5: nao pode remover creatina
  it("flags a missing creatine component", () => {
    const shake = fullShake();
    shake.items = shake.items.filter((i) => i.id !== "creatina");
    expect(validateShakeComposition(shake).missingComponents).toContain("Creatina");
  });

  // #25.6: nao pode remover fruta
  it("flags a missing fruit component", () => {
    const shake = fullShake();
    shake.items = shake.items.filter((i) => i.id !== "banana");
    expect(validateShakeComposition(shake).missingComponents).toContain("Fruta");
  });

  // #25.7: nao pode remover leite
  it("flags a missing milk component", () => {
    const shake = fullShake();
    shake.items = shake.items.filter((i) => i.id !== "leite");
    expect(validateShakeComposition(shake).missingComponents).toContain("Leite desnatado");
  });

  // #25.8: nao pode remover aveia
  it("flags a missing oats component", () => {
    const shake = fullShake();
    shake.items = shake.items.filter((i) => i.id !== "aveia");
    expect(validateShakeComposition(shake).missingComponents).toContain("Aveia");
  });

  // #25.9: nao pode remover castanhas
  it("flags a missing nuts component", () => {
    const shake = fullShake();
    shake.items = shake.items.filter((i) => i.id !== "castanha");
    expect(validateShakeComposition(shake).missingComponents).toContain("Castanhas");
  });

  it("flags a component whose quantity was zeroed out even if the row still exists", () => {
    const shake = fullShake();
    const whey = shake.items.find((i) => i.id === "whey")!;
    whey.currentGrams = 0;
    expect(validateShakeComposition(shake).missingComponents).toContain("Whey");
  });

  it("flags a component present but not marked mandatory", () => {
    const shake = fullShake();
    const whey = shake.items.find((i) => i.id === "whey")!;
    whey.isMandatory = false;
    expect(validateShakeComposition(shake).missingComponents).toContain("Whey");
  });
});
