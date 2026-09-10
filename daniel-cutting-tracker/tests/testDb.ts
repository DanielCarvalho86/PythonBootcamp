import { prisma } from "@/lib/database/prisma";

/** Wipes every table between integration tests, in FK-safe order. This
 * runs against prisma/test.db, a dedicated SQLite file (see
 * package.json's "pretest" script), never the dev database. */
export async function resetDb(): Promise<void> {
  await prisma.adjustmentLog.deleteMany();
  await prisma.supplementEntry.deleteMany();
  await prisma.waterEntry.deleteMany();
  await prisma.weightEntry.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.physicalActivity.deleteMany();
  await prisma.mealEntry.deleteMany();
  await prisma.planMealItem.deleteMany();
  await prisma.planMeal.deleteMany();
  await prisma.nutritionPlan.deleteMany();
  await prisma.food.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}

export { prisma };
