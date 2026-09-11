import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { getProgressData } from "@/lib/services/getProgress";
import { getHistory } from "@/lib/services/getHistory";
import { getActivePlanForDate } from "@/lib/services/dayPlan";
import { Card, StatRow } from "@/components/dashboard/Card";
import { ActivityChart, BalanceChart, CaloriesChart, MacrosChart, WeightChart } from "@/components/charts/HistoryCharts";

const RANGE_OPTIONS = [7, 14, 30, 60, 90];

const TREND_LABEL: Record<string, string> = {
  down: "↓ Perdendo peso",
  stable: "→ Estavel",
  up: "↑ Ganhando peso",
};

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const userId = await requireUserId();
  const params = await searchParams;
  const range = RANGE_OPTIONS.includes(Number(params.range)) ? Number(params.range) : 30;

  const [summary, historyData, plan] = await Promise.all([
    getProgressData(userId, range),
    getHistory(userId, range),
    getActivePlanForDate(userId, new Date()),
  ]);

  const { weight, trend, nutrition, activity, energy } = summary;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">Minha evolucao</h1>
        <div className="mt-2 flex gap-2">
          {RANGE_OPTIONS.map((r) => (
            <Link
              key={r}
              href={`/progress?range=${r}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                r === range ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {r}d
            </Link>
          ))}
        </div>
      </div>

      <Card title="Resumo de peso">
        <StatRow label="Peso inicial" value={`${weight.initialWeightKg.toFixed(2)} kg`} sub={weight.initialWeightDate} />
        <StatRow label="Peso atual" value={weight.currentWeightKg !== null ? `${weight.currentWeightKg.toFixed(2)} kg` : "-"} />
        <StatRow
          label="Variacao total"
          value={weight.totalChangeKg !== null ? `${weight.totalChangeKg > 0 ? "+" : ""}${weight.totalChangeKg.toFixed(2)} kg` : "-"}
        />
        <StatRow label="Media 7 dias" value={weight.sevenDayAverageKg !== null ? `${weight.sevenDayAverageKg.toFixed(2)} kg` : "-"} />
        <StatRow
          label="Variacao ultima semana"
          value={weight.lastWeekChangeKg !== null ? `${weight.lastWeekChangeKg > 0 ? "+" : ""}${weight.lastWeekChangeKg.toFixed(2)} kg` : "-"}
        />
      </Card>

      <Card title="Tendencia de peso">
        {trend.hasEnoughData ? (
          <>
            <p className="text-lg font-semibold text-zinc-900">{TREND_LABEL[trend.direction ?? "stable"]}</p>
            <p className="text-xs text-zinc-500">
              {trend.changePerWeekKg !== null ? `${trend.changePerWeekKg > 0 ? "+" : ""}${trend.changePerWeekKg.toFixed(2)} kg/semana` : ""} · media
              movel de 7 dias
            </p>
          </>
        ) : (
          <p className="text-sm text-zinc-400">Dados insuficientes para calcular tendencia.</p>
        )}
      </Card>

      <Card title="Alimentacao (media do periodo)">
        <StatRow label="Calorias" value={`${Math.round(nutrition.avgCalories)} kcal`} sub={plan ? `meta ${plan.caloriesTarget} kcal` : undefined} />
        <StatRow label="Proteina" value={`${Math.round(nutrition.avgProtein)} g`} sub={plan ? `meta ${plan.proteinTarget} g` : undefined} />
        <StatRow label="Carboidratos" value={`${Math.round(nutrition.avgCarbs)} g`} sub={plan ? `meta ${plan.carbsTarget} g` : undefined} />
        <StatRow label="Gorduras" value={`${Math.round(nutrition.avgFat)} g`} sub={plan ? `meta ${plan.fatTarget} g` : undefined} />
        <StatRow label="Fibras" value={`${Math.round(nutrition.avgFiber)} g`} sub={plan ? `meta ${plan.fiberMin}-${plan.fiberMax} g` : undefined} />
      </Card>

      <Card title="Atividade">
        <StatRow label="Media de passos" value={String(activity.avgSteps)} />
        <StatRow label="Sessoes de musculacao" value={String(activity.weightTrainingSessions)} />
        <StatRow label="Sessoes de natacao" value={String(activity.swimmingSessions)} />
        <StatRow label="Caminhadas" value={String(activity.walkingSessions)} />
        <StatRow label="Cardio" value={String(activity.cardioSessions)} />
        <StatRow label="Outras atividades" value={String(activity.otherSessions)} />
      </Card>

      <Card title="Gasto energetico (estimado)">
        <StatRow label="Media de calorias de atividade" value={`${Math.round(energy.avgActivityCaloriesKcal)} kcal`} />
        <StatRow label="Media de gasto estimado (TDEE)" value={`${Math.round(energy.avgEstimatedTdeeKcal)} kcal`} />
        <StatRow
          label="Media de deficit/superavit estimado"
          value={`${energy.avgEstimatedDeficitKcal > 0 ? "+" : ""}${Math.round(energy.avgEstimatedDeficitKcal)} kcal`}
        />
        <p className="mt-2 text-[11px] text-zinc-400">
          Todos os valores de gasto energetico sao estimativas, nunca medicoes exatas.
        </p>
      </Card>

      <WeightChart data={historyData} />
      <CaloriesChart data={historyData} />
      <MacrosChart data={historyData} />
      <ActivityChart data={historyData} />
      <BalanceChart data={historyData} />
    </div>
  );
}
