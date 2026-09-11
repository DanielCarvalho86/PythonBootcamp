import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDb } from "../testDb";
import { createTestUserWithPlan } from "../fixtures";
import { processUserMessage } from "@/lib/services/processMessage";
import { parseFoodFormData } from "@/lib/validation/foodSchema";

const DAY1 = "2026-09-10";

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

// These integration tests exercise the same Prisma calls the "use server"
// actions in src/app/(app)/settings/foods/actions.ts perform, without
// going through the actions themselves — those call requireUserId(),
// which needs next/headers' cookies() and therefore a real request scope
// that isn't available under plain Vitest (same pattern already used for
// editMealEntryAction/deleteMealEntryAction in dayFlow.test.ts).

describe("food editor — create/edit/activate", () => {
  it("creates a food that defaults to active", async () => {
    const parsed = parseFoodFormData(
      formData({
        name: "Frango grelhado caseiro",
        category: "protein",
        servingUnit: "g",
        caloriesPer100g: "165",
        proteinPer100g: "31",
        carbsPer100g: "0",
        fatPer100g: "3.6",
        fiberPer100g: "0",
      }),
    );
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const food = await prisma.food.create({ data: parsed.data });
    expect(food.active).toBe(true);
    expect(food.name).toBe("Frango grelhado caseiro");
  });

  it("edits an existing food's nutrition facts", async () => {
    const food = await prisma.food.create({
      data: { name: "Aveia", category: "carb", servingUnit: "g", caloriesPer100g: 350, proteinPer100g: 10, carbsPer100g: 60, fatPer100g: 5, fiberPer100g: 8 },
    });
    const parsed = parseFoodFormData(
      formData({ name: "Aveia em flocos", category: "carb", servingUnit: "g", caloriesPer100g: "394", proteinPer100g: "13.9", carbsPer100g: "67", fatPer100g: "8.5", fiberPer100g: "9.1" }),
    );
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const updated = await prisma.food.update({ where: { id: food.id }, data: parsed.data });
    expect(updated.name).toBe("Aveia em flocos");
    expect(updated.caloriesPer100g).toBe(394);
  });

  it("deactivates then reactivates a food", async () => {
    const food = await prisma.food.create({
      data: { name: "Iogurte natural", category: "dairy", servingUnit: "g", caloriesPer100g: 61, proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 3.3, fiberPer100g: 0 },
    });

    const deactivated = await prisma.food.update({ where: { id: food.id }, data: { active: false } });
    expect(deactivated.active).toBe(false);

    const reactivated = await prisma.food.update({ where: { id: food.id }, data: { active: true } });
    expect(reactivated.active).toBe(true);
  });
});

describe("food editor — active/inactive interaction with the logging pipeline", () => {
  it("a deactivated food is no longer matched for new registrations", async () => {
    const { user } = await createTestUserWithPlan();
    const food = await prisma.food.create({
      data: { name: "Salame", category: "protein", servingUnit: "g", caloriesPer100g: 400, proteinPer100g: 20, carbsPer100g: 1, fatPer100g: 35, fiberPer100g: 0 },
    });

    await prisma.food.update({ where: { id: food.id }, data: { active: false } });

    const result = await processUserMessage(user.id, "Comi 50g de salame.", DAY1);
    expect(result.unresolvedFoodItems).toContain("salame");
    const entry = await prisma.mealEntry.findUniqueOrThrow({ where: { id: result.createdMealEntryIds[0] } });
    expect(entry.foodId).toBeNull();
    expect(entry.isEstimated).toBe(true);
  });

  it("a deactivated food remains attached to its historical meal entries", async () => {
    const { user } = await createTestUserWithPlan();
    const food = await prisma.food.create({
      data: { name: "Queijo minas", category: "dairy", servingUnit: "g", caloriesPer100g: 264, proteinPer100g: 17.4, carbsPer100g: 3.2, fatPer100g: 20, fiberPer100g: 0 },
    });

    const result = await processUserMessage(user.id, "Comi 50g de queijo minas.", DAY1);
    const entryBefore = await prisma.mealEntry.findUniqueOrThrow({ where: { id: result.createdMealEntryIds[0] } });
    expect(entryBefore.foodId).toBe(food.id);

    await prisma.food.update({ where: { id: food.id }, data: { active: false } });

    const entryAfter = await prisma.mealEntry.findUniqueOrThrow({ where: { id: result.createdMealEntryIds[0] }, include: { food: true } });
    expect(entryAfter.foodId).toBe(food.id);
    expect(entryAfter.food?.name).toBe("Queijo minas");
    expect(entryAfter.food?.active).toBe(false);
  });

  it("a newly created food is immediately matchable by the natural-language parser", async () => {
    const { user } = await createTestUserWithPlan();
    await prisma.food.create({
      data: {
        name: "Frango grelhado caseiro",
        category: "protein",
        servingUnit: "g",
        caloriesPer100g: 165,
        proteinPer100g: 31,
        carbsPer100g: 0,
        fatPer100g: 3.6,
        fiberPer100g: 0,
      },
    });

    const result = await processUserMessage(user.id, "Comi 200g de frango grelhado caseiro.", DAY1);
    expect(result.unresolvedFoodItems).toHaveLength(0);
    const entry = await prisma.mealEntry.findUniqueOrThrow({ where: { id: result.createdMealEntryIds[0] } });
    expect(entry.grams).toBe(200);
    expect(entry.calories).toBeCloseTo(330); // 200g @ 165kcal/100g
  });
});

describe("food editor — search and filters", () => {
  it("finds foods by a case-insensitive name or category substring", async () => {
    await prisma.food.createMany({
      data: [
        { name: "Frango peito grelhado", category: "protein", servingUnit: "g", caloriesPer100g: 159, proteinPer100g: 32, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
        { name: "Tilapia grelhada", category: "protein", servingUnit: "g", caloriesPer100g: 129, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 2.7, fiberPer100g: 0 },
        { name: "Cuscuz cozido", category: "carb", servingUnit: "g", caloriesPer100g: 112, proteinPer100g: 2.5, carbsPer100g: 25, fatPer100g: 0.2, fiberPer100g: 1.5 },
      ],
    });

    const byName = await prisma.food.findMany({ where: { name: { contains: "frango" } } });
    expect(byName).toHaveLength(1);

    const byCategory = await prisma.food.findMany({ where: { category: { contains: "protein" } } });
    expect(byCategory).toHaveLength(2);
  });

  it("filters foods by active/inactive status", async () => {
    const active = await prisma.food.create({
      data: { name: "Ativo", category: "x", servingUnit: "g", caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, fiberPer100g: 0 },
    });
    const inactive = await prisma.food.create({
      data: { name: "Inativo", category: "x", servingUnit: "g", caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, fiberPer100g: 0, active: false },
    });

    const activeOnly = await prisma.food.findMany({ where: { active: true } });
    expect(activeOnly.map((f) => f.id)).toContain(active.id);
    expect(activeOnly.map((f) => f.id)).not.toContain(inactive.id);

    const inactiveOnly = await prisma.food.findMany({ where: { active: false } });
    expect(inactiveOnly.map((f) => f.id)).toContain(inactive.id);
    expect(inactiveOnly.map((f) => f.id)).not.toContain(active.id);
  });
});
