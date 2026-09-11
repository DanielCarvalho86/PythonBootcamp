import { subDays } from "date-fns";
import { prisma } from "@/lib/database/prisma";
import { buildProgressSummary, type ProgressSummary } from "@/lib/analysis/progress";

const WEIGHT_TREND_LOOKBACK_DAYS = 21; // extra lookback so the trend has enough history even for a short period filter

export async function getProgressData(userId: string, periodDays: number): Promise<ProgressSummary> {
  const since = subDays(new Date(), periodDays - 1);
  since.setUTCHours(0, 0, 0, 0);
  const weightSince = subDays(since, WEIGHT_TREND_LOOKBACK_DAYS);

  const [profile, logs, weights, activities] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.dailyLog.findMany({ where: { userId, date: { gte: since } }, orderBy: { date: "asc" } }),
    prisma.weightEntry.findMany({ where: { userId, date: { gte: weightSince } }, orderBy: { date: "asc" } }),
    prisma.physicalActivity.findMany({ where: { userId, date: { gte: since } }, orderBy: { date: "asc" } }),
  ]);

  const dateKeys: string[] = [];
  for (let i = 0; i < periodDays; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    dateKeys.push(d.toISOString().slice(0, 10));
  }
  const logByDate = new Map(logs.map((l) => [l.date.toISOString().slice(0, 10), l]));

  const dailyLogs = dateKeys.map((date) => {
    const log = logByDate.get(date);
    return {
      date,
      caloriesConsumedKcal: log?.caloriesConsumedKcal ?? 0,
      proteinConsumedG: log?.proteinConsumedG ?? 0,
      carbsConsumedG: log?.carbsConsumedG ?? 0,
      fatConsumedG: log?.fatConsumedG ?? 0,
      fiberConsumedG: log?.fiberConsumedG ?? 0,
      estimatedTdeeKcal: log?.estimatedTdeeKcal ?? 0,
      totalActivityCaloriesKcal: log?.totalActivityCaloriesKcal ?? 0,
    };
  });

  return buildProgressSummary({
    referenceWeightKg: profile?.referenceWeightKg ?? 0,
    referenceWeightDate: profile?.referenceWeightAt.toISOString().slice(0, 10) ?? dateKeys[0],
    weightEntries: weights.map((w) => ({ date: w.date.toISOString().slice(0, 10), weightKg: w.weightKg })),
    dailyLogs,
    activities: activities.map((a) => ({
      activityType: a.activityType,
      steps: a.steps,
      caloriesBurned: a.caloriesBurned,
      includedInActivityTotal: a.includedInActivityTotal,
    })),
    periodDays,
  });
}
