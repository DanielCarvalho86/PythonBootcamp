import {
  calculateActivityAverages,
  calculateEnergyBalanceTrend,
  calculateNutritionAverages,
  calculateRollingAverage,
  calculateWeightTrend,
  type ActivityAverages,
  type DatedValue,
  type EnergyBalanceTrend,
  type NutritionAverages,
  type WeightTrendResult,
} from "@/lib/analysis/trend";
import { round2 } from "@/lib/nutrition/engine";

export interface ProgressSummaryInput {
  referenceWeightKg: number;
  referenceWeightDate: string;
  weightEntries: { date: string; weightKg: number }[]; // within the selected period (plus a little lookback for trend)
  dailyLogs: {
    date: string;
    caloriesConsumedKcal: number;
    proteinConsumedG: number;
    carbsConsumedG: number;
    fatConsumedG: number;
    fiberConsumedG: number;
    estimatedTdeeKcal: number;
    totalActivityCaloriesKcal: number;
  }[];
  activities: { activityType: string; steps: number | null; caloriesBurned: number; includedInActivityTotal: boolean }[];
  periodDays: number;
}

export interface WeightSummary {
  initialWeightKg: number;
  initialWeightDate: string;
  currentWeightKg: number | null;
  totalChangeKg: number | null;
  sevenDayAverageKg: number | null;
  lastWeekChangeKg: number | null;
}

export interface ProgressSummary {
  weight: WeightSummary;
  trend: WeightTrendResult;
  weightSeries: DatedValue[];
  weightRollingAverageSeries: DatedValue[];
  nutrition: NutritionAverages;
  activity: ActivityAverages;
  energy: EnergyBalanceTrend;
}

export function buildProgressSummary(input: ProgressSummaryInput): ProgressSummary {
  const sortedWeights = [...input.weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const weightSeries: DatedValue[] = sortedWeights.map((w) => ({ date: w.date, value: w.weightKg }));
  const weightRollingAverageSeries = calculateRollingAverage(weightSeries, 7);

  const currentWeightKg = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weightKg : null;
  const sevenDayAverageKg =
    weightRollingAverageSeries.length > 0 ? weightRollingAverageSeries[weightRollingAverageSeries.length - 1].value : null;

  const trend = calculateWeightTrend(sortedWeights);

  const weight: WeightSummary = {
    initialWeightKg: input.referenceWeightKg,
    initialWeightDate: input.referenceWeightDate,
    currentWeightKg,
    totalChangeKg: currentWeightKg !== null ? round2(currentWeightKg - input.referenceWeightKg) : null,
    sevenDayAverageKg,
    lastWeekChangeKg: trend.hasEnoughData ? trend.changeKg : null,
  };

  const nutrition = calculateNutritionAverages(input.dailyLogs);
  const energy = calculateEnergyBalanceTrend(input.dailyLogs);
  const activity = calculateActivityAverages(
    input.activities,
    input.dailyLogs.map((l) => l.totalActivityCaloriesKcal),
    input.periodDays,
  );

  return { weight, trend, weightSeries, weightRollingAverageSeries, nutrition, activity, energy };
}
