import { prisma } from "@/lib/database/prisma";
import { subDays } from "date-fns";

export interface HistoryPoint {
  date: string;
  weightKg: number | null;
  weightMovingAvg7d: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: number;
  activityCalories: number;
  estimatedTdee: number;
  balance: number;
}

export async function getHistory(userId: string, days: number): Promise<HistoryPoint[]> {
  const since = subDays(new Date(), days - 1);
  since.setUTCHours(0, 0, 0, 0);

  const [logs, weights, activities] = await Promise.all([
    prisma.dailyLog.findMany({ where: { userId, date: { gte: since } }, orderBy: { date: "asc" } }),
    prisma.weightEntry.findMany({ where: { userId, date: { gte: subDays(since, 7) } }, orderBy: { date: "asc" } }),
    prisma.physicalActivity.findMany({
      where: { userId, date: { gte: since }, activityType: "steps" },
      orderBy: { date: "asc" },
    }),
  ]);

  const dateKeys: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    dateKeys.push(d.toISOString().slice(0, 10));
  }

  const weightByDate = new Map<string, number>();
  for (const w of weights) weightByDate.set(w.date.toISOString().slice(0, 10), w.weightKg);

  const stepsByDate = new Map<string, number>();
  for (const a of activities) if (a.steps) stepsByDate.set(a.date.toISOString().slice(0, 10), a.steps);

  const logByDate = new Map(logs.map((l) => [l.date.toISOString().slice(0, 10), l]));

  return dateKeys.map((dateKey) => {
    const log = logByDate.get(dateKey);
    const weightKg = weightByDate.get(dateKey) ?? null;

    // 7-day trailing moving average over whatever weight entries exist.
    const windowStart = subDays(new Date(dateKey), 6).toISOString().slice(0, 10);
    const windowValues = [...weightByDate.entries()]
      .filter(([d]) => d >= windowStart && d <= dateKey)
      .map(([, v]) => v);
    const weightMovingAvg7d =
      windowValues.length > 0
        ? Math.round((windowValues.reduce((s, v) => s + v, 0) / windowValues.length) * 100) / 100
        : null;

    return {
      date: dateKey,
      weightKg,
      weightMovingAvg7d,
      calories: log?.caloriesConsumedKcal ?? 0,
      protein: log?.proteinConsumedG ?? 0,
      carbs: log?.carbsConsumedG ?? 0,
      fat: log?.fatConsumedG ?? 0,
      steps: stepsByDate.get(dateKey) ?? 0,
      activityCalories: log?.totalActivityCaloriesKcal ?? 0,
      estimatedTdee: log?.estimatedTdeeKcal ?? 0,
      balance: log ? log.caloriesConsumedKcal - log.estimatedTdeeKcal : 0,
    };
  });
}
