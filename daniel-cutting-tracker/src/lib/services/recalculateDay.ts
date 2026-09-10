import { prisma } from "@/lib/database/prisma";
import { calculateDailyNutrition, sumNutrients } from "@/lib/nutrition/engine";
import {
  calculateActivityTotal,
  calculateEnergyBalance,
  calculateEstimatedTDEE,
  detectStepDoubleCounting,
} from "@/lib/activities/engine";
import { calculateAgeYears, calculateMifflinStJeorBmr } from "@/lib/calculations/bmr";
import { adjustRemainingMeals, type AdjustmentResult } from "@/lib/adjustment/engine";
import {
  buildFutureAdjustableMeals,
  getActivePlanForDate,
  getConsumedMealTypesForDate,
  getLatestAdjustmentForDate,
  planToTargets,
  snapshotMeals,
} from "@/lib/services/dayPlan";
import type { ActivityType, CaloriesSource, NutrientTotals } from "@/types/domain";

export interface RecalculateDayResult {
  dayTotals: NutrientTotals;
  activityCaloriesTotal: number;
  estimatedBmrKcal: number;
  estimatedTdeeKcal: number;
  energyBalance: ReturnType<typeof calculateEnergyBalance>;
  doubleCountingWarnings: ReturnType<typeof detectStepDoubleCounting>;
  adjustment: AdjustmentResult | null;
}

/**
 * Recomputes the DailyLog snapshot for a user/date from the detailed
 * MealEntry/PhysicalActivity/WeightEntry/WaterEntry rows, and — when
 * `triggerAdjustment` is true — reruns the least-change adjustment engine
 * over the day's not-yet-consumed plan meals and records the result as a
 * new AdjustmentLog row (never overwriting previous ones, per spec
 * section 37's audit-trail requirement).
 *
 * This is the single place "STEP 6-9" of the message pipeline (spec
 * section 57) and every edit/delete recalculation path converge on, so
 * the dashboard, the message inbox, and manual edits all stay consistent.
 */
export async function recalculateDay(
  userId: string,
  date: Date,
  options: { triggerAdjustment: boolean; adjustmentReason?: string; triggerMealEntryId?: string },
): Promise<RecalculateDayResult> {
  const [mealEntries, activities, profile, existingLog, weightEntryToday, waterEntries] = await Promise.all([
    prisma.mealEntry.findMany({ where: { userId, date } }),
    prisma.physicalActivity.findMany({ where: { userId, date } }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.dailyLog.findUnique({ where: { userId_date: { userId, date } } }),
    prisma.weightEntry.findFirst({ where: { userId, date }, orderBy: { createdAt: "desc" } }),
    prisma.waterEntry.findMany({ where: { userId, date } }),
  ]);

  const dayTotals = calculateDailyNutrition(
    mealEntries.map((e) => ({
      calories: e.calories,
      protein: e.protein,
      carbs: e.carbs,
      fat: e.fat,
      fiber: e.fiber,
    })),
  );

  const activityRecords = activities.map((a) => ({
    id: a.id,
    activityType: a.activityType as ActivityType,
    caloriesBurned: a.caloriesBurned,
    caloriesSource: a.caloriesSource as CaloriesSource,
    steps: a.steps,
    durationMinutes: a.durationMinutes,
    includedInActivityTotal: a.includedInActivityTotal,
  }));
  const activityCaloriesTotal = calculateActivityTotal(activityRecords);
  const doubleCountingWarnings = detectStepDoubleCounting(activityRecords);

  let estimatedBmrKcal = profile?.deviceBmrKcal ?? 1700;
  if (profile && !profile.deviceBmrKcal) {
    const weightForBmr = weightEntryToday?.weightKg ?? profile.referenceWeightKg;
    estimatedBmrKcal = calculateMifflinStJeorBmr({
      sex: profile.sex === "female" ? "female" : "male",
      weightKg: weightForBmr,
      heightCm: profile.heightCm,
      ageYears: calculateAgeYears(profile.birthDate, date),
    });
  }

  const estimatedTdeeKcal = calculateEstimatedTDEE(estimatedBmrKcal, activityCaloriesTotal);
  const energyBalance = calculateEnergyBalance(estimatedTdeeKcal, dayTotals.calories);
  const waterMl = waterEntries.reduce((sum, w) => sum + w.amountMl, 0);

  const plan = await getActivePlanForDate(userId, date);

  let adjustment: AdjustmentResult | null = null;
  let dayStatus: "on_track" | "above_target" | "below_target" = "on_track";

  if (plan) {
    if (options.triggerAdjustment) {
      const consumedMealTypes = await getConsumedMealTypesForDate(userId, date);
      const latestAdjustment = await getLatestAdjustmentForDate(userId, date);
      const futureMeals = await buildFutureAdjustableMeals(plan.id, consumedMealTypes, latestAdjustment);
      const targets = planToTargets(plan);

      adjustment = adjustRemainingMeals({ targets, consumedNutrition: dayTotals, futureMeals });
      dayStatus = adjustment.dayStatus;

      await prisma.adjustmentLog.create({
        data: {
          userId,
          date,
          triggerMealEntryId: options.triggerMealEntryId,
          reason: options.adjustmentReason ?? "Recalculo apos novo registro",
          originalPlanJson: JSON.stringify(
            snapshotMeals(futureMeals.map((m) => ({ ...m, items: m.items.map((i) => ({ ...i })) }))),
          ),
          adjustedPlanJson: JSON.stringify(snapshotMeals(adjustment.adjustedFutureMeals)),
          changesJson: JSON.stringify(adjustment.changes),
          warningsJson: JSON.stringify(adjustment.warnings),
        },
      });
    } else {
      dayStatus = dayTotals.calories > plan.caloriesMax ? "above_target" : "on_track";
    }
  }

  await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date } },
    create: {
      userId,
      date,
      weightKg: weightEntryToday?.weightKg ?? null,
      totalActivityCaloriesKcal: activityCaloriesTotal,
      estimatedBmrKcal,
      estimatedTdeeKcal,
      caloriesConsumedKcal: dayTotals.calories,
      proteinConsumedG: dayTotals.protein,
      carbsConsumedG: dayTotals.carbs,
      fatConsumedG: dayTotals.fat,
      fiberConsumedG: dayTotals.fiber,
      waterMl,
      dayStatus,
    },
    update: {
      weightKg: weightEntryToday?.weightKg ?? existingLog?.weightKg ?? null,
      totalActivityCaloriesKcal: activityCaloriesTotal,
      estimatedBmrKcal,
      estimatedTdeeKcal,
      caloriesConsumedKcal: dayTotals.calories,
      proteinConsumedG: dayTotals.protein,
      carbsConsumedG: dayTotals.carbs,
      fatConsumedG: dayTotals.fat,
      fiberConsumedG: dayTotals.fiber,
      waterMl,
      dayStatus,
    },
  });

  return {
    dayTotals,
    activityCaloriesTotal,
    estimatedBmrKcal,
    estimatedTdeeKcal,
    energyBalance,
    doubleCountingWarnings,
    adjustment,
  };
}

export function combineTotals(a: NutrientTotals, b: NutrientTotals): NutrientTotals {
  return sumNutrients(a, b);
}
