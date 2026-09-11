import { describe, expect, it } from "vitest";
import { parseMessageRuleBased } from "@/lib/ai/ruleBasedParser";

const TODAY = "2026-09-10";

describe("parseMessageRuleBased", () => {
  it("parses a simple meal with multiple gram-quantified items", () => {
    const result = parseMessageRuleBased("Comi 200g de frango, 150g de cuscuz e 10g de azeite.", { today: TODAY });
    expect(result.meals).toHaveLength(1);
    expect(result.meals[0].items).toEqual(
      expect.arrayContaining([
        { food: "frango", quantity: 200, unit: "g" },
        { food: "cuscuz", quantity: 150, unit: "g" },
        { food: "azeite", quantity: 10, unit: "g" },
      ]),
    );
  });

  // TEST20: quantidade em unidade
  it("parses unit-quantified items like '2 ovos'", () => {
    const result = parseMessageRuleBased("Comi 2 ovos, 1 pao frances e cafe com 15g de leite em po.", { today: TODAY });
    const items = result.meals[0].items;
    expect(items.find((i) => i.food === "ovos")).toEqual({ food: "ovos", quantity: 2, unit: "unit" });
    expect(items.find((i) => i.food.includes("pao"))).toMatchObject({ quantity: 1, unit: "unit" });
  });

  it("detects meal type from keywords", () => {
    const result = parseMessageRuleBased("No almoco comi 200g de tilapia e 150g de arroz.", { today: TODAY });
    expect(result.meals[0].mealType).toBe("lunch");
  });

  // TEST9: musculacao com duracao "1h15" e calorias
  it("parses weight training duration and calories", () => {
    const result = parseMessageRuleBased("Fiz musculacao por 1h15 e gastei 620 kcal.", { today: TODAY });
    expect(result.activities).toHaveLength(1);
    expect(result.activities[0]).toMatchObject({ activityType: "weight_training", durationMinutes: 75, caloriesBurned: 620 });
  });

  // TEST10: natacao
  it("parses swimming duration and calories", () => {
    const result = parseMessageRuleBased("Nadei 45 minutos e gastei 400 kcal.", { today: TODAY });
    expect(result.activities[0]).toMatchObject({ activityType: "swimming", durationMinutes: 45, caloriesBurned: 400 });
  });

  // TEST11: passos (formato "8.500" com separador de milhar pt-BR)
  it("parses a steps count with thousands separator and calories", () => {
    const result = parseMessageRuleBased("Hoje dei 8.500 passos e gastei 350 calorias.", { today: TODAY });
    expect(result.steps).toBe(8500);
    expect(result.stepsCalories).toBe(350);
  });

  // TEST12: outra atividade (futebol)
  it("parses a generic sports activity", () => {
    const result = parseMessageRuleBased("Joguei futebol por 1 hora e gastei 700 kcal.", { today: TODAY });
    expect(result.activities[0]).toMatchObject({ activityType: "sports", durationMinutes: 60, caloriesBurned: 700 });
  });

  it("parses weight entries", () => {
    const result = parseMessageRuleBased("Peso hoje 107,45 kg.", { today: TODAY });
    expect(result.weight).toEqual({ weightKg: 107.45 });
  });

  it("parses water entries in ml", () => {
    const result = parseMessageRuleBased("Bebi 500ml de agua.", { today: TODAY });
    expect(result.waterMl).toBe(500);
  });

  // TEST21: mensagem contendo alimentacao + atividade
  it("parses a mixed message combining meal and activity information", () => {
    const result = parseMessageRuleBased(
      "Comi 200g de tilapia e 150g de arroz. Fiz musculacao por 1h e gastei 550 kcal. Hoje dei 9000 passos.",
      { today: TODAY },
    );
    expect(result.meals).toHaveLength(1);
    expect(result.activities).toHaveLength(1);
    expect(result.steps).toBe(9000);
  });

  // TEST18: alimento desconhecido / mensagem ambigua deve pedir esclarecimento
  it("flags an unparseable fragment for clarification instead of guessing", () => {
    const result = parseMessageRuleBased("Comi um sanduiche.", { today: TODAY });
    expect(result.needsClarification).toBeDefined();
  });
});
