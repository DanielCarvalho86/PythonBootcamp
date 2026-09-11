import { prisma } from "@/lib/database/prisma";
import { toDateOnly } from "@/lib/services/dateOnly";
import {
  buildFutureAdjustableMeals,
  getActivePlanForDate,
  getConsumedMealTypesForDate,
  getLatestAdjustmentForDate,
} from "@/lib/services/dayPlan";
import { calculateMealNutrition } from "@/lib/nutrition/engine";
import { calculateWeightTrend } from "@/lib/analysis/trend";
import { subDays } from "date-fns";

// Wide enough that calculateWeightTrend (7d rolling avg vs. the 7d avg
// from ~7 days before that) has real history to compare, not just today's window.
const WEIGHT_TREND_LOOKBACK_DAYS = 21;

export async function getDashboardData(userId: string, dateStr: string) {
  const date = toDateOnly(dateStr);

  const [mealEntries, activities, dailyLog, plan, recentWeights, weightsForTrend, waterEntries, supplements] = await Promise.all([
    prisma.mealEntry.findMany({ where: { userId, date }, include: { food: true }, orderBy: { createdAt: "asc" } }),
    prisma.physicalActivity.findMany({ where: { userId, date }, orderBy: { createdAt: "asc" } }),
    prisma.dailyLog.findUnique({ where: { userId_date: { userId, date } } }),
    getActivePlanForDate(userId, date),
    prisma.weightEntry.findMany({
      where: { userId, date: { gte: subDays(date, 7) } },
      orderBy: { date: "asc" },
    }),
    prisma.weightEntry.findMany({
      where: { userId, date: { gte: subDays(date, WEIGHT_TREND_LOOKBACK_DAYS) } },
      orderBy: { date: "asc" },
    }),
    prisma.waterEntry.findMany({ where: { userId, date } }),
    prisma.supplementEntry.findMany({ where: { userId, date } }),
  ]);

  const weightTrend = calculateWeightTrend(
    weightsForTrend.map((w) => ({ date: w.date.toISOString().slice(0, 10), weightKg: w.weightKg })),
  );

  const mealsByType = new Map<string, typeof mealEntries>();
  for (const entry of mealEntries) {
    const list = mealsByType.get(entry.mealType) ?? [];
    list.push(entry);
    mealsByType.set(entry.mealType, list);
  }

  let futurePlanMeals: Awaited<ReturnType<typeof buildFutureAdjustableMeals>> = [];
  let planMealsAll: { id: string; mealType: string; name: string; order: number }[] = [];
  if (plan) {
    const consumedMealTypes = await getConsumedMealTypesForDate(userId, date);
    const latestAdjustment = await getLatestAdjustmentForDate(userId, date);
    futurePlanMeals = await buildFutureAdjustableMeals(plan.id, consumedMealTypes, latestAdjustment);
    planMealsAll = await prisma.planMeal.findMany({
      where: { planId: plan.id },
      orderBy: { order: "asc" },
      select: { id: true, mealType: true, name: true, order: true },
    });
  }

  const weightSorted = [...recentWeights].sort((a, b) => a.date.getTime() - b.date.getTime());
  const currentWeight = weightSorted.at(-1)?.weightKg ?? null;
  const sevenDayAvg =
    weightSorted.length > 0
      ? Math.round((weightSorted.reduce((s, w) => s + w.weightKg, 0) / weightSorted.length) * 100) / 100
      : null;

  const waterTotalMl = waterEntries.reduce((sum, w) => sum + w.amountMl, 0);

  return {
    date: dateStr,
    plan,
    mealsByType,
    mealEntries,
    activities,
    dailyLog,
    futurePlanMeals,
    planMealsAll,
    currentWeight,
    sevenDayAvgWeight: sevenDayAvg,
    weightTrend,
    waterTotalMl,
    supplements,
  };
}

export function futureMealPlannedTotals(meals: Awaited<ReturnType<typeof buildFutureAdjustableMeals>>) {
  return meals.map((meal) => ({
    id: meal.id,
    name: meal.name,
    mealType: meal.mealType,
    isProtectedComposition: meal.isProtectedComposition,
    items: meal.items,
    totals: calculateMealNutrition(meal.items.map((i) => ({ grams: i.currentGrams, facts: i.facts }))),
  }));
}
