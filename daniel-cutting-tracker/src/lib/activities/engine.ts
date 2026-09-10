import type { ActivityType, CaloriesSource } from "@/types/domain";
import { round2 } from "@/lib/nutrition/engine";

/**
 * Deterministic activity/energy-balance math (spec sections 11-18, 41).
 * Nothing here talks to the database — callers pass in already-loaded rows.
 */

export interface ActivityRecord {
  id: string;
  activityType: ActivityType;
  caloriesBurned: number;
  caloriesSource: CaloriesSource;
  steps: number | null;
  durationMinutes: number | null;
  includedInActivityTotal: boolean;
}

/**
 * Sums calories burned across a day's activities, skipping any entry
 * explicitly flagged as already included in another entry's total — this
 * is the step/activity double-counting guard (spec section 17, 41:
 * detectStepDoubleCounting).
 */
export function calculateActivityTotal(activities: ActivityRecord[]): number {
  const total = activities
    .filter((a) => a.includedInActivityTotal)
    .reduce((sum, a) => sum + a.caloriesBurned, 0);
  return round2(total);
}

export interface DoubleCountingWarning {
  stepsActivityId: string;
  conflictingActivityId: string;
  reason: string;
}

/**
 * Flags when a "steps" activity coexists with a walking/cardio activity on
 * the same day whose duration/description suggests the step count is
 * already embedded in that other activity's calorie figure. This never
 * auto-deletes anything — it just returns warnings for the caller to show
 * and, if the user confirms, mark `includedInActivityTotal = false` on one
 * of the rows.
 */
export function detectStepDoubleCounting(activities: ActivityRecord[]): DoubleCountingWarning[] {
  const stepsEntries = activities.filter((a) => a.activityType === "steps");
  const overlapCandidates = activities.filter(
    (a) => a.activityType === "walking" || a.activityType === "running",
  );

  const warnings: DoubleCountingWarning[] = [];
  for (const stepsEntry of stepsEntries) {
    for (const other of overlapCandidates) {
      if (!stepsEntry.includedInActivityTotal || !other.includedInActivityTotal) continue;
      warnings.push({
        stepsActivityId: stepsEntry.id,
        conflictingActivityId: other.id,
        reason:
          "Passos registrados no mesmo dia de uma caminhada/corrida — verifique se o gasto dos passos já está incluído na atividade antes de somar os dois.",
      });
    }
  }
  return warnings;
}

/**
 * Total estimated daily energy expenditure = basal metabolic rate +
 * activity calories. BMR itself is supplied by the caller (from the
 * user's editable profile / device estimate) — this module never invents
 * a BMR formula on its own since section 3 says biometric data must be
 * treated as an editable estimate, not ground truth.
 */
export function calculateEstimatedTDEE(estimatedBmrKcal: number, activityCaloriesKcal: number): number {
  return round2(estimatedBmrKcal + activityCaloriesKcal);
}

export interface EnergyBalance {
  estimatedTdeeKcal: number;
  caloriesConsumedKcal: number;
  balanceKcal: number; // negative = deficit, positive = surplus
  isEstimate: true;
}

/**
 * gasto energético estimado - calorias consumidas = déficit/superávit
 * estimado (spec section 18). Always returned with `isEstimate: true` so
 * UI layers are forced to acknowledge and label it as an estimate rather
 * than a precise measurement.
 */
export function calculateEnergyBalance(
  estimatedTdeeKcal: number,
  caloriesConsumedKcal: number,
): EnergyBalance {
  return {
    estimatedTdeeKcal: round2(estimatedTdeeKcal),
    caloriesConsumedKcal: round2(caloriesConsumedKcal),
    balanceKcal: round2(caloriesConsumedKcal - estimatedTdeeKcal),
    isEstimate: true,
  };
}

/**
 * Fallback calorie estimate for steps when the user provides a step count
 * but no device/app calorie reading. Uses a simple, transparent
 * kcal-per-step heuristic (~0.04 kcal/step, roughly right for an adult
 * around 100-110kg) — always marked as estimated so it's never confused
 * with a device measurement (spec section 12).
 */
export function estimateStepsCalories(steps: number, weightKg = 107): number {
  if (steps < 0) throw new Error("steps must be >= 0");
  const kcalPerStepPerKg = 0.0004; // ≈ 0.04 kcal/step at 100kg
  return round2(steps * weightKg * kcalPerStepPerKg);
}
