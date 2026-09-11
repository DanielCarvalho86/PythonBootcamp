import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { getDashboardData } from "@/lib/services/getDashboard";
import { todayDateOnlyString } from "@/lib/services/dateOnly";
import { calculateEnergyBalance } from "@/lib/activities/engine";
import { planToTargets } from "@/lib/services/dayPlan";
import { syncAlertsForToday } from "@/lib/services/syncAlerts";
import { MessageInbox } from "@/components/forms/MessageInbox";
import { WeightCard } from "@/components/dashboard/WeightCard";
import { NutritionCard } from "@/components/dashboard/NutritionCard";
import { ActivityCard } from "@/components/dashboard/ActivityCard";
import { EnergyBalanceCard } from "@/components/dashboard/EnergyBalanceCard";
import { PlanCard, type ConsumedEntry } from "@/components/dashboard/PlanCard";
import { AlertsSummaryCard } from "@/components/dashboard/AlertsSummaryCard";
import { QuickAddBar } from "@/components/dashboard/quickadd/QuickAddBar";
import { detectStepDoubleCounting } from "@/lib/activities/engine";
import type { ActivityType, CaloriesSource } from "@/types/domain";

export default async function TodayPage() {
  const userId = await requireUserId();
  const today = todayDateOnlyString();

  const [profile, dashboard, activeFoods, alertCandidates] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    getDashboardData(userId, today),
    prisma.food.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    syncAlertsForToday(userId, today),
  ]);

  const consumed = {
    calories: dashboard.dailyLog?.caloriesConsumedKcal ?? 0,
    protein: dashboard.dailyLog?.proteinConsumedG ?? 0,
    carbs: dashboard.dailyLog?.carbsConsumedG ?? 0,
    fat: dashboard.dailyLog?.fatConsumedG ?? 0,
    fiber: dashboard.dailyLog?.fiberConsumedG ?? 0,
  };

  const targets = dashboard.plan ? planToTargets(dashboard.plan) : null;

  const bmr = dashboard.dailyLog?.estimatedBmrKcal ?? profile?.deviceBmrKcal ?? 0;
  const activityCalories = dashboard.dailyLog?.totalActivityCaloriesKcal ?? 0;
  const tdee = dashboard.dailyLog?.estimatedTdeeKcal ?? bmr + activityCalories;
  const balance = calculateEnergyBalance(tdee, consumed.calories);

  const activityWarnings = detectStepDoubleCounting(
    dashboard.activities.map((a) => ({
      id: a.id,
      activityType: a.activityType as ActivityType,
      caloriesBurned: a.caloriesBurned,
      caloriesSource: a.caloriesSource as CaloriesSource,
      steps: a.steps,
      durationMinutes: a.durationMinutes,
      includedInActivityTotal: a.includedInActivityTotal,
    })),
  ).map((w) => w.reason);

  const consumedByMealType = new Map<string, ConsumedEntry[]>();
  for (const [mealType, entries] of dashboard.mealsByType) {
    consumedByMealType.set(
      mealType,
      entries.map((e) => ({
        id: e.id,
        foodId: e.foodId,
        food: e.food ? { name: e.food.name } : null,
        freeTextDescription: e.freeTextDescription,
        quantity: e.quantity,
        unit: e.unit,
        calories: e.calories,
        protein: e.protein,
        carbs: e.carbs,
        fat: e.fat,
        fiber: e.fiber,
        isEstimated: e.isEstimated,
      })),
    );
  }

  const wheyEntry = dashboard.supplements.find((s) => s.type === "whey");
  const creatineEntry = dashboard.supplements.find((s) => s.type === "creatine");
  const supplementDefaults = {
    wheyTargetG: dashboard.plan?.wheyTargetG ?? wheyEntry?.targetGrams ?? 40,
    creatineTargetG: dashboard.plan?.creatineTargetG ?? creatineEntry?.targetGrams ?? 5,
    wheyTaken: wheyEntry?.taken ?? false,
    creatineTaken: creatineEntry?.taken ?? false,
  };

  const weightTrendArrow =
    dashboard.currentWeight !== null && dashboard.sevenDayAvgWeight !== null
      ? dashboard.currentWeight < dashboard.sevenDayAvgWeight - 0.1
        ? "↓"
        : dashboard.currentWeight > dashboard.sevenDayAvgWeight + 0.1
          ? "↑"
          : "→"
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">Hoje</h1>
        <p className="text-xs text-zinc-500">{today}</p>
        {dashboard.dailyLog?.dayStatus === "above_target" && (
          <p className="mt-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Seu consumo de hoje ja esta acima da meta planejada. As proximas refeicoes foram preservadas dentro dos
            limites configurados.
          </p>
        )}
      </div>

      {profile && (
        <WeightCard
          currentWeight={dashboard.currentWeight}
          referenceWeight={profile.referenceWeightKg}
          referenceDate={profile.referenceWeightAt.toISOString().slice(0, 10)}
          sevenDayAvg={dashboard.sevenDayAvgWeight}
        />
      )}

      <MessageInbox />

      <QuickAddBar
        dateStr={today}
        foods={activeFoods}
        supplementDefaults={supplementDefaults}
        waterCurrentMl={dashboard.waterTotalMl}
        waterTargetMl={dashboard.plan?.waterMinMl ?? 3000}
      />

      <NutritionCard consumed={consumed} targets={targets} />

      <ActivityCard
        activities={dashboard.activities.map((a) => ({
          id: a.id,
          activityType: a.activityType,
          description: a.description,
          durationMinutes: a.durationMinutes,
          steps: a.steps,
          caloriesBurned: a.caloriesBurned,
          caloriesSource: a.caloriesSource,
          includedInActivityTotal: a.includedInActivityTotal,
        }))}
        totalCalories={activityCalories}
        warnings={activityWarnings}
      />

      <EnergyBalanceCard bmr={bmr} activityCalories={activityCalories} tdee={tdee} consumed={consumed.calories} balance={balance.balanceKcal} />

      {dashboard.plan && (
        <PlanCard planMealOrder={dashboard.planMealsAll} consumedByMealType={consumedByMealType} futureMeals={dashboard.futurePlanMeals} />
      )}

      {targets && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-500">
          <p>
            Agua: {Math.round(dashboard.waterTotalMl)} / {targets ? `${dashboard.plan?.waterMinMl}-${dashboard.plan?.waterMaxMl}` : "-"} ml
          </p>
          <p>
            Suplementos: {dashboard.supplements.filter((s) => s.taken).map((s) => s.type).join(", ") || "nenhum marcado hoje"}
          </p>
        </div>
      )}

      <AlertsSummaryCard alerts={alertCandidates.map((c, i) => ({ id: `${c.type}-${i}`, severity: c.severity, title: c.title, message: c.message }))} />

      <Link
        href="/progress"
        className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 hover:border-zinc-300"
      >
        <span>
          Minha evolucao {weightTrendArrow && <span className="ml-1 text-base">{weightTrendArrow}</span>}
        </span>
        <span className="text-xs text-zinc-400">ver detalhes →</span>
      </Link>
    </div>
  );
}
