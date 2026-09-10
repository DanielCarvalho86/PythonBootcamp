import { prisma } from "@/lib/database/prisma";

export async function createTestUserWithPlan(dateStr = "2026-09-10") {
  const user = await prisma.user.create({
    data: { email: `test-${Date.now()}-${Math.random()}@example.com`, passwordHash: "x" },
  });

  await prisma.profile.create({
    data: {
      userId: user.id,
      name: "Test",
      sex: "male",
      birthDate: new Date("1986-12-22"),
      heightCm: 173,
      referenceWeightKg: 107.45,
      referenceWeightAt: new Date(dateStr),
      deviceBmrKcal: 1770,
    },
  });

  const frango = await prisma.food.create({
    data: {
      name: "Frango peito grelhado",
      category: "protein",
      servingUnit: "g",
      caloriesPer100g: 159,
      proteinPer100g: 32,
      carbsPer100g: 0,
      fatPer100g: 2.5,
      fiberPer100g: 0,
    },
  });
  const cuscuz = await prisma.food.create({
    data: {
      name: "Cuscuz cozido",
      category: "carb",
      servingUnit: "g",
      caloriesPer100g: 112,
      proteinPer100g: 2.5,
      carbsPer100g: 25,
      fatPer100g: 0.2,
      fiberPer100g: 1.5,
    },
  });
  const azeite = await prisma.food.create({
    data: {
      name: "Azeite de oliva",
      category: "fat",
      servingUnit: "g",
      caloriesPer100g: 884,
      proteinPer100g: 0,
      carbsPer100g: 0,
      fatPer100g: 100,
      fiberPer100g: 0,
    },
  });
  const ovo = await prisma.food.create({
    data: {
      name: "Ovo cozido",
      category: "protein",
      servingUnit: "unit",
      gramsPerUnit: 50,
      caloriesPer100g: 155,
      proteinPer100g: 13,
      carbsPer100g: 1.1,
      fatPer100g: 11,
      fiberPer100g: 0,
    },
  });
  const whey = await prisma.food.create({
    data: {
      name: "Whey protein concentrado",
      category: "supplement",
      servingUnit: "g",
      caloriesPer100g: 400,
      proteinPer100g: 80,
      carbsPer100g: 8,
      fatPer100g: 5,
      fiberPer100g: 0,
    },
  });
  const banana = await prisma.food.create({
    data: {
      name: "Banana congelada",
      category: "fruit",
      servingUnit: "g",
      caloriesPer100g: 98,
      proteinPer100g: 1.3,
      carbsPer100g: 26,
      fatPer100g: 0.1,
      fiberPer100g: 2,
    },
  });

  const plan = await prisma.nutritionPlan.create({
    data: {
      userId: user.id,
      name: "Semana teste",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-30"),
      isActive: true,
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
      fiberMax: 40,
      waterMinMl: 3000,
      waterMaxMl: 3500,
    },
  });

  await prisma.planMeal.create({
    data: {
      planId: plan.id,
      mealType: "breakfast",
      name: "Cafe da manha",
      order: 1,
      items: {
        create: [{ foodId: ovo.id, targetQuantityG: 100, minQuantityG: 50, maxQuantityG: 150, adjustmentStepG: 50, role: "protein" }],
      },
    },
  });

  await prisma.planMeal.create({
    data: {
      planId: plan.id,
      mealType: "other",
      name: "Shake",
      order: 2,
      isProtectedComposition: true,
      items: {
        create: [
          { foodId: whey.id, targetQuantityG: 40, minQuantityG: 30, maxQuantityG: 50, adjustmentStepG: 5, role: "protein", isMandatory: true },
          { foodId: banana.id, targetQuantityG: 100, minQuantityG: 50, maxQuantityG: 150, adjustmentStepG: 10, role: "carb", isMandatory: true },
        ],
      },
    },
  });

  const dinner = await prisma.planMeal.create({
    data: {
      planId: plan.id,
      mealType: "dinner",
      name: "Jantar",
      order: 3,
      items: {
        create: [
          { foodId: frango.id, targetQuantityG: 200, minQuantityG: 150, maxQuantityG: 300, adjustmentStepG: 10, role: "protein" },
          { foodId: cuscuz.id, targetQuantityG: 150, minQuantityG: 50, maxQuantityG: 250, adjustmentStepG: 10, role: "carb" },
          { foodId: azeite.id, targetQuantityG: 10, minQuantityG: 0, maxQuantityG: 20, adjustmentStepG: 5, role: "fat" },
        ],
      },
    },
  });

  return { user, plan, foods: { frango, cuscuz, azeite, ovo, whey, banana }, dinnerMealId: dinner.id };
}
