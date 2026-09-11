import type { WeightTrendResult } from "@/lib/analysis/trend";

/**
 * Deterministic, non-diagnostic caution detection (spec: "Não criar
 * alertas alarmistas. Não diagnosticar doenças. Não substituir avaliação
 * profissional."). Every rule requires several days of corroborating data
 * — never a single meal or a single weigh-in — and every message is
 * informational: none of these alerts trigger any automatic change to the
 * diet, activity, or plan. That's enforced structurally: this module has
 * no write access to anything, it only returns candidate alerts for a
 * caller to persist/display.
 */

export const ALERT_TYPES = [
  "LOW_INTAKE",
  "HIGH_DEFICIT",
  "RAPID_WEIGHT_LOSS",
  "LOW_ENERGY",
  "HIGH_HUNGER",
  "PERFORMANCE_DROP",
  "LOW_PROTEIN",
  "LOW_HYDRATION",
  "HIGH_ACTIVITY",
] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_SEVERITIES = ["INFO", "NOTICE", "WARNING"] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export interface AlertCandidate {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data: Record<string, number | string>;
}

export interface DailyLogPoint {
  date: string;
  caloriesConsumedKcal: number;
  proteinConsumedG: number;
  estimatedTdeeKcal: number;
  waterMl: number;
  hunger: number | null;
  energy: number | null;
  trainingPerformance: number | null;
}

export interface DetectAlertsInput {
  /** Most recent ~7 days, oldest first. Fewer than MIN_DAYS_FOR_ALERT
   * disables every day-count-based rule for that metric. */
  recentDailyLogs: DailyLogPoint[];
  weightTrend: WeightTrendResult;
  avgActivityCaloriesPerDay: number;
  targets: {
    caloriesMin: number;
    proteinMin: number;
    waterMinMl: number;
  } | null;
}

const MIN_DAYS_FOR_ALERT = 5; // need at least this many days of data in the window
const MIN_DAYS_BELOW_TO_FLAG = 4; // ...and the condition must hold on at least this many of them
const HIGH_DEFICIT_THRESHOLD_KCAL = -700; // per-day estimated deficit considered "elevated"
const RAPID_LOSS_KG_PER_WEEK = 1; // widely-cited conservative fat-loss ceiling; not a medical claim
const HIGH_ACTIVITY_KCAL_PER_DAY = 800;
const LOW_SCALE_THRESHOLD = 2; // hunger/energy/performance scale is 1-5
const HIGH_SCALE_THRESHOLD = 4;
const MIN_SUBJECTIVE_DAYS = 3; // hunger/energy/performance are opt-in, so require fewer days

export function detectAlerts(input: DetectAlertsInput): AlertCandidate[] {
  const candidates: AlertCandidate[] = [];
  const logs = input.recentDailyLogs;
  const totalDays = logs.length;

  if (input.targets && totalDays >= MIN_DAYS_FOR_ALERT) {
    const daysLowProtein = logs.filter((l) => l.proteinConsumedG < input.targets!.proteinMin * 0.9).length;
    if (daysLowProtein >= MIN_DAYS_BELOW_TO_FLAG) {
      candidates.push({
        type: "LOW_PROTEIN",
        severity: "NOTICE",
        title: "Proteina abaixo da meta",
        message: `Proteina ficou abaixo da meta em ${daysLowProtein} dos ultimos ${totalDays} dias.`,
        data: { daysLowProtein, totalDays },
      });
    }

    const daysLowWater = logs.filter((l) => l.waterMl < input.targets!.waterMinMl * 0.9).length;
    if (daysLowWater >= MIN_DAYS_BELOW_TO_FLAG) {
      candidates.push({
        type: "LOW_HYDRATION",
        severity: "NOTICE",
        title: "Hidratacao abaixo da meta",
        message: `Sua hidratacao ficou abaixo da meta em ${daysLowWater} dos ultimos ${totalDays} dias.`,
        data: { daysLowWater, totalDays },
      });
    }

    const daysLowIntake = logs.filter((l) => l.caloriesConsumedKcal < input.targets!.caloriesMin).length;
    if (daysLowIntake >= MIN_DAYS_BELOW_TO_FLAG) {
      candidates.push({
        type: "LOW_INTAKE",
        severity: "NOTICE",
        title: "Ingestao abaixo do planejado",
        message: `Sua ingestao ficou abaixo da faixa planejada em ${daysLowIntake} dos ultimos ${totalDays} dias. Isso nao deve ser corrigido reduzindo ainda mais a alimentacao.`,
        data: { daysLowIntake, totalDays },
      });
    }
  }

  if (totalDays >= MIN_DAYS_FOR_ALERT) {
    const daysHighDeficit = logs.filter((l) => l.caloriesConsumedKcal - l.estimatedTdeeKcal < HIGH_DEFICIT_THRESHOLD_KCAL).length;
    if (daysHighDeficit >= MIN_DAYS_BELOW_TO_FLAG) {
      candidates.push({
        type: "HIGH_DEFICIT",
        severity: "WARNING",
        title: "Deficit estimado elevado",
        message: `O deficit energetico estimado esteve elevado em ${daysHighDeficit} dos ultimos ${totalDays} dias. Isso e uma estimativa, nao uma medicao exata — nao vamos recomendar jejum, compensacao ou aumento de atividade automaticamente.`,
        data: { daysHighDeficit, totalDays },
      });
    }

    const avgActivity = input.avgActivityCaloriesPerDay;
    if (avgActivity > HIGH_ACTIVITY_KCAL_PER_DAY) {
      candidates.push({
        type: "HIGH_ACTIVITY",
        severity: "INFO",
        title: "Nivel de atividade elevado",
        message: "Seu nivel de atividade esteve elevado. Observe recuperacao, energia e desempenho — isso nao aumenta automaticamente sua meta alimentar.",
        data: { avgActivityCaloriesPerDay: avgActivity },
      });
    }
  }

  if (input.weightTrend.hasEnoughData && input.weightTrend.direction === "down") {
    const weeklyLoss = Math.abs(input.weightTrend.changePerWeekKg ?? 0);
    if (weeklyLoss > RAPID_LOSS_KG_PER_WEEK) {
      candidates.push({
        type: "RAPID_WEIGHT_LOSS",
        severity: "WARNING",
        title: "Perda de peso acelerada",
        message: "A tendencia de perda de peso esta mais rapida do que o planejado. Vale revisar ingestao, recuperacao e acompanhamento profissional.",
        data: { changePerWeekKg: input.weightTrend.changePerWeekKg ?? 0 },
      });
    }
  }

  const daysWithEnergy = logs.filter((l) => l.energy !== null);
  if (daysWithEnergy.length >= MIN_SUBJECTIVE_DAYS) {
    const daysLowEnergy = daysWithEnergy.filter((l) => (l.energy as number) <= LOW_SCALE_THRESHOLD).length;
    if (daysLowEnergy >= MIN_SUBJECTIVE_DAYS) {
      candidates.push({
        type: "LOW_ENERGY",
        severity: "NOTICE",
        title: "Energia baixa",
        message: `Sua energia esteve baixa em ${daysLowEnergy} dos ${daysWithEnergy.length} dias registrados.`,
        data: { daysLowEnergy, daysWithData: daysWithEnergy.length },
      });
    }
  }

  const daysWithHunger = logs.filter((l) => l.hunger !== null);
  if (daysWithHunger.length >= MIN_SUBJECTIVE_DAYS) {
    const daysHighHunger = daysWithHunger.filter((l) => (l.hunger as number) >= HIGH_SCALE_THRESHOLD).length;
    if (daysHighHunger >= MIN_SUBJECTIVE_DAYS) {
      candidates.push({
        type: "HIGH_HUNGER",
        severity: "NOTICE",
        title: "Fome elevada",
        message: `Sua fome esteve elevada em ${daysHighHunger} dos ${daysWithHunger.length} dias registrados. Isso nao deve ser respondido reduzindo mais as calorias automaticamente.`,
        data: { daysHighHunger, daysWithData: daysWithHunger.length },
      });
    }
  }

  const daysWithPerformance = logs.filter((l) => l.trainingPerformance !== null);
  if (daysWithPerformance.length >= MIN_SUBJECTIVE_DAYS) {
    const daysLowPerformance = daysWithPerformance.filter((l) => (l.trainingPerformance as number) <= LOW_SCALE_THRESHOLD).length;
    if (daysLowPerformance >= MIN_SUBJECTIVE_DAYS) {
      candidates.push({
        type: "PERFORMANCE_DROP",
        severity: "NOTICE",
        title: "Queda de desempenho nos treinos",
        message: `Desempenho registrado como baixo em ${daysLowPerformance} dos ${daysWithPerformance.length} treinos recentes. Considere ingestao, deficit, atividade, energia e fome ao avaliar.`,
        data: { daysLowPerformance, daysWithData: daysWithPerformance.length },
      });
    }
  }

  return candidates;
}
