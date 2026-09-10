import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Nutrition facts are approximate values in the style of the Brazilian
// TACO food composition table / common nutrition labels. They are seed
// data meant to get the app running end to end — not medical-grade figures
// — and are flagged `verified: false` unless noted otherwise so the UI/
// future curation work can tell them apart from confirmed entries (spec
// section 9: "verified" column).
const FOODS = [
  { name: "Frango peito grelhado", category: "protein", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 159, proteinPer100g: 32, carbsPer100g: 0, fatPer100g: 2.5, fiberPer100g: 0 },
  { name: "Tilapia grelhada", category: "protein", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 129, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 2.7, fiberPer100g: 0 },
  { name: "Patinho moido cozido", category: "protein", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 172, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 5, fiberPer100g: 0 },
  { name: "Ovo cozido", category: "protein", servingUnit: "unit", gramsPerUnit: 50, caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0 },
  { name: "Whey protein concentrado", category: "supplement", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 8, fatPer100g: 5, fiberPer100g: 0 },
  { name: "Creatina monohidratada", category: "supplement", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0, fiberPer100g: 0 },
  { name: "Cuscuz cozido", category: "carb", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 112, proteinPer100g: 2.5, carbsPer100g: 25, fatPer100g: 0.2, fiberPer100g: 1.5 },
  { name: "Arroz branco cozido", category: "carb", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 128, proteinPer100g: 2.5, carbsPer100g: 28, fatPer100g: 0.2, fiberPer100g: 1.6 },
  { name: "Feijao carioca cozido", category: "carb", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 76, proteinPer100g: 4.8, carbsPer100g: 13.6, fatPer100g: 0.5, fiberPer100g: 8.4 },
  { name: "Aveia em flocos", category: "carb", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 394, proteinPer100g: 13.9, carbsPer100g: 67, fatPer100g: 8.5, fiberPer100g: 9.1 },
  { name: "Pao frances", category: "carb", servingUnit: "unit", gramsPerUnit: 50, caloriesPer100g: 300, proteinPer100g: 8, carbsPer100g: 58, fatPer100g: 3, fiberPer100g: 2.3 },
  { name: "Macaxeira cozida", category: "carb", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 125, proteinPer100g: 0.6, carbsPer100g: 30, fatPer100g: 0.3, fiberPer100g: 1.6 },
  { name: "Inhame cozido", category: "carb", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 118, proteinPer100g: 2.1, carbsPer100g: 27.6, fatPer100g: 0.2, fiberPer100g: 4.1 },
  { name: "Batata inglesa cozida", category: "carb", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 52, proteinPer100g: 1.2, carbsPer100g: 11.9, fatPer100g: 0.1, fiberPer100g: 1.3 },
  { name: "Banana prata", category: "fruit", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26, fatPer100g: 0.1, fiberPer100g: 2 },
  { name: "Banana congelada", category: "fruit", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26, fatPer100g: 0.1, fiberPer100g: 2 },
  { name: "Leite desnatado", category: "dairy", servingUnit: "ml", gramsPerUnit: null, caloriesPer100g: 35, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 0.2, fiberPer100g: 0 },
  { name: "Leite em po integral", category: "dairy", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 496, proteinPer100g: 25.4, carbsPer100g: 38.4, fatPer100g: 26.9, fiberPer100g: 0 },
  { name: "Cafe preparado", category: "beverage", servingUnit: "cup", gramsPerUnit: 200, caloriesPer100g: 2, proteinPer100g: 0.1, carbsPer100g: 0.3, fatPer100g: 0, fiberPer100g: 0 },
  { name: "Azeite de oliva", category: "fat", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0 },
  { name: "Maionese", category: "fat", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 680, proteinPer100g: 1, carbsPer100g: 3, fatPer100g: 75, fiberPer100g: 0 },
  { name: "Castanha do para", category: "fat", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 656, proteinPer100g: 14.3, carbsPer100g: 12.3, fatPer100g: 66.4, fiberPer100g: 7.9 },
  { name: "Tomate", category: "vegetable", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 15, proteinPer100g: 1.1, carbsPer100g: 3.9, fatPer100g: 0.2, fiberPer100g: 1.2 },
  { name: "Cebola", category: "vegetable", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 40, proteinPer100g: 1.7, carbsPer100g: 9.3, fatPer100g: 0.1, fiberPer100g: 1.7 },
  { name: "Cenoura", category: "vegetable", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 34, proteinPer100g: 1.3, carbsPer100g: 7.7, fatPer100g: 0.2, fiberPer100g: 3.2 },
  { name: "Polpa de fruta", category: "fruit", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 50, proteinPer100g: 0.6, carbsPer100g: 12, fatPer100g: 0.2, fiberPer100g: 1.5 },
  { name: "Pizza (fatia media)", category: "outside_plan", servingUnit: "g", gramsPerUnit: null, caloriesPer100g: 266, proteinPer100g: 11, carbsPer100g: 33, fatPer100g: 10, fiberPer100g: 2.3 },
] as const;

async function main() {
  const email = process.env.AUTH_USER_EMAIL || "daniel@example.com";
  const rawPassword = process.env.SEED_USER_PASSWORD || "cutting2026";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      name: "Daniel",
      sex: "male",
      birthDate: new Date("1986-12-22"),
      heightCm: 173,
      referenceWeightKg: 107.45,
      referenceWeightAt: new Date("2026-09-10"),
      bodyFatPercent: 39.6,
      fatMassKg: 42.6,
      muscleMassKg: 60.5,
      skeletalMuscleKg: 37.1,
      visceralFat: 19,
      bmi: 35.9,
      deviceBmrKcal: 1770,
    },
  });

  const foodIdByName = new Map<string, string>();
  for (const f of FOODS) {
    const food = await prisma.food.upsert({
      where: { id: `seed-${slug(f.name)}` },
      update: {},
      create: {
        id: `seed-${slug(f.name)}`,
        name: f.name,
        category: f.category,
        servingUnit: f.servingUnit,
        gramsPerUnit: f.gramsPerUnit,
        caloriesPer100g: f.caloriesPer100g,
        proteinPer100g: f.proteinPer100g,
        carbsPer100g: f.carbsPer100g,
        fatPer100g: f.fatPer100g,
        fiberPer100g: f.fiberPer100g,
        source: "taco_approx",
        verified: false,
      },
    });
    foodIdByName.set(f.name, food.id);
  }

  const existingPlan = await prisma.nutritionPlan.findFirst({
    where: { userId: user.id, name: "Semana 3" },
  });
  if (existingPlan) {
    console.log("Semana 3 plan already seeded, skipping plan/meal creation.");
  } else {
    const plan = await prisma.nutritionPlan.create({
      data: {
        userId: user.id,
        name: "Semana 3",
        startDate: new Date("2026-09-10"),
        endDate: new Date("2026-09-16"),
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
        creatineTargetG: 5,
        wheyTargetG: 40,
        notes:
          "Semana 3 (10/09/2026-16/09/2026). Evitar salmao, batata-doce e quinoa. Priorizar cuscuz, pao, macaxeira, inhame, batata, arroz e feijao. Evitar arroz+feijao no jantar.",
      },
    });

    const foodId = (name: string) => {
      const id = foodIdByName.get(name);
      if (!id) throw new Error(`Seed food not found: ${name}`);
      return id;
    };

    await prisma.planMeal.create({
      data: {
        planId: plan.id,
        mealType: "breakfast",
        name: "Cafe da manha",
        order: 1,
        isProtectedComposition: false,
        items: {
          create: [
            { foodId: foodId("Ovo cozido"), targetQuantityG: 100, minQuantityG: 50, maxQuantityG: 150, adjustmentStepG: 50, role: "protein" },
            { foodId: foodId("Pao frances"), targetQuantityG: 50, minQuantityG: 0, maxQuantityG: 100, adjustmentStepG: 50, role: "carb" },
            { foodId: foodId("Leite em po integral"), targetQuantityG: 15, minQuantityG: 10, maxQuantityG: 20, adjustmentStepG: 5, role: "fixed" },
            { foodId: foodId("Cafe preparado"), targetQuantityG: 200, minQuantityG: 0, maxQuantityG: 400, adjustmentStepG: 200, role: "fixed" },
          ],
        },
      },
    });

    await prisma.planMeal.create({
      data: {
        planId: plan.id,
        mealType: "lunch",
        name: "Almoco",
        order: 2,
        isProtectedComposition: false,
        items: {
          create: [
            { foodId: foodId("Tilapia grelhada"), targetQuantityG: 200, minQuantityG: 150, maxQuantityG: 300, adjustmentStepG: 10, role: "protein" },
            { foodId: foodId("Arroz branco cozido"), targetQuantityG: 150, minQuantityG: 50, maxQuantityG: 250, adjustmentStepG: 10, role: "carb" },
            { foodId: foodId("Feijao carioca cozido"), targetQuantityG: 100, minQuantityG: 50, maxQuantityG: 200, adjustmentStepG: 10, role: "carb" },
            { foodId: foodId("Tomate"), targetQuantityG: 70, minQuantityG: 0, maxQuantityG: 150, adjustmentStepG: 10, role: "fixed" },
            { foodId: foodId("Cebola"), targetQuantityG: 25, minQuantityG: 0, maxQuantityG: 50, adjustmentStepG: 5, role: "fixed" },
            { foodId: foodId("Cenoura"), targetQuantityG: 20, minQuantityG: 0, maxQuantityG: 50, adjustmentStepG: 5, role: "fixed" },
            { foodId: foodId("Azeite de oliva"), targetQuantityG: 10, minQuantityG: 5, maxQuantityG: 20, adjustmentStepG: 5, role: "fat" },
          ],
        },
      },
    });

    // Shake — permanent-rule meal (spec section 6). Every item is
    // mandatory so the adjustment engine may resize but never zero it out.
    await prisma.planMeal.create({
      data: {
        planId: plan.id,
        mealType: "other",
        name: "Shake",
        order: 3,
        isProtectedComposition: true,
        items: {
          create: [
            { foodId: foodId("Whey protein concentrado"), targetQuantityG: 40, minQuantityG: 30, maxQuantityG: 50, adjustmentStepG: 5, role: "protein", isMandatory: true },
            { foodId: foodId("Banana congelada"), targetQuantityG: 100, minQuantityG: 50, maxQuantityG: 150, adjustmentStepG: 10, role: "carb", isMandatory: true },
            { foodId: foodId("Leite desnatado"), targetQuantityG: 200, minQuantityG: 150, maxQuantityG: 250, adjustmentStepG: 25, role: "fixed", isMandatory: true },
            { foodId: foodId("Aveia em flocos"), targetQuantityG: 10, minQuantityG: 5, maxQuantityG: 20, adjustmentStepG: 5, role: "carb", isMandatory: true },
            { foodId: foodId("Castanha do para"), targetQuantityG: 5, minQuantityG: 3, maxQuantityG: 10, adjustmentStepG: 1, role: "fat", isMandatory: true },
            { foodId: foodId("Creatina monohidratada"), targetQuantityG: 5, minQuantityG: 5, maxQuantityG: 5, adjustmentStepG: 0, role: "fixed", isMandatory: true },
          ],
        },
      },
    });

    await prisma.planMeal.create({
      data: {
        planId: plan.id,
        mealType: "dinner",
        name: "Jantar",
        order: 4,
        isProtectedComposition: false,
        items: {
          create: [
            { foodId: foodId("Frango peito grelhado"), targetQuantityG: 200, minQuantityG: 150, maxQuantityG: 300, adjustmentStepG: 10, role: "protein" },
            { foodId: foodId("Cuscuz cozido"), targetQuantityG: 150, minQuantityG: 50, maxQuantityG: 250, adjustmentStepG: 10, role: "carb" },
            { foodId: foodId("Tomate"), targetQuantityG: 50, minQuantityG: 0, maxQuantityG: 100, adjustmentStepG: 10, role: "fixed" },
            { foodId: foodId("Cebola"), targetQuantityG: 15, minQuantityG: 0, maxQuantityG: 40, adjustmentStepG: 5, role: "fixed" },
            { foodId: foodId("Azeite de oliva"), targetQuantityG: 5, minQuantityG: 0, maxQuantityG: 15, adjustmentStepG: 5, role: "fat" },
          ],
        },
      },
    });

    console.log(`Seeded plan "${plan.name}" with 4 meals.`);
  }

  console.log(`Seed complete. Login email: ${email}${process.env.SEED_USER_PASSWORD ? "" : ` (default password: ${rawPassword} — change it after first login)`}`);
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
