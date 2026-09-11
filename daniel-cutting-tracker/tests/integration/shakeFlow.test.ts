import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDb } from "../testDb";
import { createTestUserWithPlan } from "../fixtures";
import { processUserMessage } from "@/lib/services/processMessage";
import { toDateOnly } from "@/lib/services/dateOnly";
import { validateShakeComposition } from "@/lib/adjustment/shakeRules";
import { buildFutureAdjustableMeals, getConsumedMealTypesForDate, getLatestAdjustmentForDate } from "@/lib/services/dayPlan";

const DAY1 = "2026-09-10";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await resetDb();
  await prisma.$disconnect();
});

describe("shake slot isolation (spec continuation section 1 / 25.1-25.2)", () => {
  it("does NOT mark the shake slot as consumed when an unclassified snack is logged", async () => {
    const { user, plan } = await createTestUserWithPlan();
    await processUserMessage(user.id, "Comi um lanche com 30g de castanha do para.", DAY1);

    const consumedMealTypes = await getConsumedMealTypesForDate(user.id, toDateOnly(DAY1));
    expect(consumedMealTypes.has("shake")).toBe(false);

    const latestAdjustment = await getLatestAdjustmentForDate(user.id, toDateOnly(DAY1));
    const futureMeals = await buildFutureAdjustableMeals(plan.id, consumedMealTypes, latestAdjustment);
    expect(futureMeals.some((m) => m.mealType === "shake")).toBe(true);
  });

  it("registering 'tomei meu shake' consumes only the shake slot, using the plan's current composition", async () => {
    const { user, foods } = await createTestUserWithPlan();
    const result = await processUserMessage(user.id, "Tomei meu shake.", DAY1);

    expect(result.createdMealEntryIds).toHaveLength(6); // whey, banana, leite, aveia, castanha, creatina

    const entries = await prisma.mealEntry.findMany({ where: { id: { in: result.createdMealEntryIds } } });
    expect(entries.every((e) => e.mealType === "shake")).toBe(true);
    expect(entries.every((e) => e.source === "plan")).toBe(true);

    const wheyEntry = entries.find((e) => e.foodId === foods.whey.id);
    expect(wheyEntry?.grams).toBe(40);
    const creatinaEntry = entries.find((e) => e.foodId === foods.creatina.id);
    expect(creatinaEntry?.grams).toBe(5);

    // Breakfast and dinner must remain unconsumed/untouched.
    const consumedMealTypes = await getConsumedMealTypesForDate(user.id, toDateOnly(DAY1));
    expect(consumedMealTypes.has("shake")).toBe(true);
    expect(consumedMealTypes.has("breakfast")).toBe(false);
    expect(consumedMealTypes.has("dinner")).toBe(false);
  });

  it("a generic snack logged before the shake does not corrupt the shake's later resolution", async () => {
    const { user, foods } = await createTestUserWithPlan();
    await processUserMessage(user.id, "Comi um lanche com 30g de castanha do para.", DAY1);
    const shakeResult = await processUserMessage(user.id, "Tomei meu shake.", DAY1);

    expect(shakeResult.createdMealEntryIds).toHaveLength(6);
    const entries = await prisma.mealEntry.findMany({ where: { id: { in: shakeResult.createdMealEntryIds } } });
    expect(entries.find((e) => e.foodId === foods.whey.id)).toBeDefined();
  });
});

describe("mandatory shake components survive adjustment (spec continuation section 2 / 25.3-25.9)", () => {
  it("keeps every mandatory shake component present and non-zero after a big meal forces heavy adjustment", async () => {
    const { user } = await createTestUserWithPlan();
    // A big breakfast that overshoots most macros, forcing the optimizer
    // to work hard on the remaining (still unconsumed) shake + dinner.
    await processUserMessage(user.id, "Comi 6 ovos.", DAY1);

    const latestAdjustment = await prisma.adjustmentLog.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    expect(latestAdjustment).toBeTruthy();

    // Re-derive the live AdjustableMeal for the shake (current, post-
    // adjustment quantities) and run the business rule check against it.
    const plan = await prisma.nutritionPlan.findFirstOrThrow({ where: { userId: user.id } });
    const consumedMealTypes = await getConsumedMealTypesForDate(user.id, toDateOnly(DAY1));
    const futureMeals = await buildFutureAdjustableMeals(plan.id, consumedMealTypes, latestAdjustment);
    const shake = futureMeals.find((m) => m.mealType === "shake")!;
    expect(validateShakeComposition(shake)).toEqual({ valid: true, missingComponents: [] });
  });
});
