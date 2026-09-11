import { subDays } from "date-fns";
import { prisma } from "@/lib/database/prisma";
import { ALERT_TYPES, detectAlerts, type AlertCandidate } from "@/lib/analysis/alerts";
import { calculateWeightTrend } from "@/lib/analysis/trend";
import { getActivePlanForDate } from "@/lib/services/dayPlan";
import { toDateOnly, todayDateOnlyString } from "@/lib/services/dateOnly";

const ALERT_WINDOW_DAYS = 7;
const WEIGHT_TREND_LOOKBACK_DAYS = 21;

/**
 * Recomputes every alert type for a user "as of" a reference date (real
 * "today" unless overridden for tests) and reconciles the Alert table:
 * an alert still true gets its message/severity/date refreshed in place
 * (its `isRead` flag is left untouched — reappearing after being read
 * would be noisy for a condition that never stopped), one no longer true
 * is deleted so /alerts only ever shows currently-relevant items. This is
 * the dedup mechanism: at most one row per (userId, type) ever exists.
 */
export async function syncAlertsForToday(userId: string, referenceDateOverride?: string): Promise<AlertCandidate[]> {
  const referenceDate = toDateOnly(referenceDateOverride ?? todayDateOnlyString());
  const windowStart = subDays(referenceDate, ALERT_WINDOW_DAYS - 1);
  const trendWindowStart = subDays(referenceDate, WEIGHT_TREND_LOOKBACK_DAYS - 1);

  const [dailyLogs, weightEntries, plan] = await Promise.all([
    prisma.dailyLog.findMany({
      where: { userId, date: { gte: windowStart, lte: referenceDate } },
      orderBy: { date: "asc" },
    }),
    prisma.weightEntry.findMany({
      where: { userId, date: { gte: trendWindowStart, lte: referenceDate } },
      orderBy: { date: "asc" },
    }),
    getActivePlanForDate(userId, referenceDate),
  ]);

  const recentDailyLogs = dailyLogs.map((l) => ({
    date: l.date.toISOString().slice(0, 10),
    caloriesConsumedKcal: l.caloriesConsumedKcal,
    proteinConsumedG: l.proteinConsumedG,
    estimatedTdeeKcal: l.estimatedTdeeKcal,
    waterMl: l.waterMl,
    hunger: l.hunger,
    energy: l.energy,
    trainingPerformance: l.trainingPerformance,
  }));

  const weightTrend = calculateWeightTrend(
    weightEntries.map((w) => ({ date: w.date.toISOString().slice(0, 10), weightKg: w.weightKg })),
  );

  const avgActivityCaloriesPerDay =
    dailyLogs.length > 0 ? dailyLogs.reduce((s, l) => s + l.totalActivityCaloriesKcal, 0) / dailyLogs.length : 0;

  const candidates = detectAlerts({
    recentDailyLogs,
    weightTrend,
    avgActivityCaloriesPerDay,
    targets: plan
      ? { caloriesMin: plan.caloriesMin, proteinMin: plan.proteinMin, waterMinMl: plan.waterMinMl }
      : null,
  });

  const activeTypes = new Set(candidates.map((c) => c.type));
  const staleTypes = ALERT_TYPES.filter((t) => !activeTypes.has(t));

  await Promise.all([
    ...candidates.map((candidate) =>
      prisma.alert.upsert({
        where: { userId_type: { userId, type: candidate.type } },
        create: {
          userId,
          date: referenceDate,
          type: candidate.type,
          severity: candidate.severity,
          title: candidate.title,
          message: candidate.message,
          dataJson: JSON.stringify(candidate.data),
          isRead: false,
        },
        update: {
          date: referenceDate,
          severity: candidate.severity,
          title: candidate.title,
          message: candidate.message,
          dataJson: JSON.stringify(candidate.data),
        },
      }),
    ),
    staleTypes.length > 0
      ? prisma.alert.deleteMany({ where: { userId, type: { in: staleTypes } } })
      : Promise.resolve(),
  ]);

  return candidates;
}
