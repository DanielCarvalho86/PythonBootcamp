import { round2 } from "@/lib/nutrition/engine";

/**
 * Weight/nutrition/activity trend analysis — all pure functions, no DB
 * access, so they're trivial to unit test. Callers (src/lib/services/*)
 * are responsible for loading the raw rows and shaping them into these
 * inputs. Every function here treats sparse data honestly: "not enough
 * data yet" is a real return value, never a guess dressed up as one.
 */

export interface DatedValue {
  date: string; // yyyy-MM-dd
  value: number;
}

/** Trailing N-day average ending at each point that has a value. Points
 * with no underlying value are simply absent from `points` — callers
 * decide whether to pass every calendar day or only days with data. */
export function calculateRollingAverage(points: DatedValue[], windowDays: number): DatedValue[] {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((point, index) => {
    const windowStart = Math.max(0, index - windowDays + 1);
    const window = sorted.slice(windowStart, index + 1);
    const average = window.reduce((sum, p) => sum + p.value, 0) / window.length;
    return { date: point.date, value: round2(average) };
  });
}

export type TrendDirection = "down" | "stable" | "up";

export interface WeightTrendResult {
  hasEnoughData: boolean;
  direction: TrendDirection | null;
  latestAverageKg: number | null;
  priorAverageKg: number | null;
  changeKg: number | null;
  changePerWeekKg: number | null;
  message: string;
}

const MIN_ENTRIES_FOR_TREND = 3;
const MIN_SPAN_DAYS_FOR_TREND = 6;
const STABLE_BAND_KG = 0.2; // changes smaller than this read as noise, not a real trend

/**
 * Never judged from a single weigh-in (spec: "não utilizar somente a
 * ultima pesagem"). Compares a trailing 7-day rolling average against the
 * rolling average from ~7 days earlier; with too little data it says so
 * explicitly instead of guessing.
 */
export function calculateWeightTrend(entries: { date: string; weightKg: number }[]): WeightTrendResult {
  const insufficient: WeightTrendResult = {
    hasEnoughData: false,
    direction: null,
    latestAverageKg: null,
    priorAverageKg: null,
    changeKg: null,
    changePerWeekKg: null,
    message: "Dados insuficientes para calcular tendencia.",
  };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < MIN_ENTRIES_FOR_TREND) return insufficient;

  const firstDate = new Date(sorted[0].date);
  const lastDate = new Date(sorted[sorted.length - 1].date);
  const spanDays = Math.round((lastDate.getTime() - firstDate.getTime()) / 86_400_000);
  if (spanDays < MIN_SPAN_DAYS_FOR_TREND) return insufficient;

  const rolling = calculateRollingAverage(
    sorted.map((e) => ({ date: e.date, value: e.weightKg })),
    7,
  );
  const latestAverageKg = rolling[rolling.length - 1].value;

  const latestDate = new Date(rolling[rolling.length - 1].date);
  const priorTargetDate = new Date(latestDate.getTime() - 7 * 86_400_000);
  const priorTargetStr = priorTargetDate.toISOString().slice(0, 10);
  // Closest rolling-average point at or before 7 days ago.
  const priorCandidates = rolling.filter((p) => p.date <= priorTargetStr);
  const priorPoint = priorCandidates.length > 0 ? priorCandidates[priorCandidates.length - 1] : rolling[0];
  const priorAverageKg = priorPoint.value;

  const changeKg = round2(latestAverageKg - priorAverageKg);
  const daysBetween = Math.max(
    1,
    Math.round((latestDate.getTime() - new Date(priorPoint.date).getTime()) / 86_400_000),
  );
  const changePerWeekKg = round2((changeKg / daysBetween) * 7);

  const direction: TrendDirection = Math.abs(changeKg) < STABLE_BAND_KG ? "stable" : changeKg < 0 ? "down" : "up";
  const message =
    direction === "down"
      ? "Tendencia de perda de peso (media movel de 7 dias)."
      : direction === "up"
        ? "Tendencia de ganho de peso (media movel de 7 dias)."
        : "Peso estavel (media movel de 7 dias).";

  return { hasEnoughData: true, direction, latestAverageKg, priorAverageKg, changeKg, changePerWeekKg, message };
}

export interface NutritionAverages {
  days: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  avgFiber: number;
}

export function calculateNutritionAverages(
  logs: { caloriesConsumedKcal: number; proteinConsumedG: number; carbsConsumedG: number; fatConsumedG: number; fiberConsumedG: number }[],
): NutritionAverages {
  const days = logs.length;
  if (days === 0) return { days: 0, avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0, avgFiber: 0 };
  const sum = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + l.caloriesConsumedKcal,
      protein: acc.protein + l.proteinConsumedG,
      carbs: acc.carbs + l.carbsConsumedG,
      fat: acc.fat + l.fatConsumedG,
      fiber: acc.fiber + l.fiberConsumedG,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
  return {
    days,
    avgCalories: round2(sum.calories / days),
    avgProtein: round2(sum.protein / days),
    avgCarbs: round2(sum.carbs / days),
    avgFat: round2(sum.fat / days),
    avgFiber: round2(sum.fiber / days),
  };
}

export interface ActivityAverages {
  days: number;
  avgSteps: number;
  avgActivityCaloriesPerDay: number;
  weightTrainingSessions: number;
  swimmingSessions: number;
  walkingSessions: number;
  cardioSessions: number;
  otherSessions: number;
}

export function calculateActivityAverages(
  activities: { activityType: string; steps: number | null; caloriesBurned: number; includedInActivityTotal: boolean }[],
  dailyActivityCalories: number[], // one entry per day in the period (0 for days with none)
  days: number,
): ActivityAverages {
  const totalSteps = activities.filter((a) => a.activityType === "steps").reduce((s, a) => s + (a.steps ?? 0), 0);
  const totalActivityCalories = dailyActivityCalories.reduce((s, v) => s + v, 0);

  const countByGroup = (predicate: (type: string) => boolean) =>
    activities.filter((a) => predicate(a.activityType)).length;

  return {
    days,
    avgSteps: days > 0 ? Math.round(totalSteps / days) : 0,
    avgActivityCaloriesPerDay: days > 0 ? round2(totalActivityCalories / days) : 0,
    weightTrainingSessions: countByGroup((t) => t === "weight_training"),
    swimmingSessions: countByGroup((t) => t === "swimming"),
    walkingSessions: countByGroup((t) => t === "walking"),
    cardioSessions: countByGroup((t) => t === "cardio"),
    otherSessions: countByGroup((t) => !["weight_training", "swimming", "walking", "cardio", "steps"].includes(t)),
  };
}

export interface EnergyBalanceTrend {
  days: number;
  avgActivityCaloriesKcal: number;
  avgEstimatedTdeeKcal: number;
  avgEstimatedDeficitKcal: number; // negative = deficit, positive = surplus, always "estimated"
}

export function calculateEnergyBalanceTrend(
  logs: { caloriesConsumedKcal: number; estimatedTdeeKcal: number; totalActivityCaloriesKcal: number }[],
): EnergyBalanceTrend {
  const days = logs.length;
  if (days === 0) return { days: 0, avgActivityCaloriesKcal: 0, avgEstimatedTdeeKcal: 0, avgEstimatedDeficitKcal: 0 };
  const sum = logs.reduce(
    (acc, l) => ({
      activity: acc.activity + l.totalActivityCaloriesKcal,
      tdee: acc.tdee + l.estimatedTdeeKcal,
      balance: acc.balance + (l.caloriesConsumedKcal - l.estimatedTdeeKcal),
    }),
    { activity: 0, tdee: 0, balance: 0 },
  );
  return {
    days,
    avgActivityCaloriesKcal: round2(sum.activity / days),
    avgEstimatedTdeeKcal: round2(sum.tdee / days),
    avgEstimatedDeficitKcal: round2(sum.balance / days),
  };
}
