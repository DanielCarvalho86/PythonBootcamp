import { Card, StatRow, Badge } from "@/components/dashboard/Card";
import type { WeightTrendResult } from "@/lib/analysis/trend";

const TREND_ARROW: Record<string, string> = { down: "↓", stable: "→", up: "↑" };
const TREND_TEXT: Record<string, string> = { down: "Perdendo peso", stable: "Peso estavel", up: "Ganhando peso" };

export function WeightCard({
  currentWeight,
  referenceWeight,
  referenceDate,
  sevenDayAvg,
  trend,
}: {
  currentWeight: number | null;
  referenceWeight: number;
  referenceDate: string;
  sevenDayAvg: number | null;
  trend: WeightTrendResult;
}) {
  const weight = currentWeight ?? referenceWeight;
  const diff = Math.round((weight - referenceWeight) * 100) / 100;
  const hasWeight = currentWeight !== null;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-500">Peso atual</p>
          {hasWeight ? (
            <p className="text-4xl font-bold tracking-tight text-zinc-900">{weight.toFixed(2)} kg</p>
          ) : (
            <p className="text-2xl font-semibold text-zinc-400">Sem registro hoje</p>
          )}
        </div>
        {hasWeight && (
          <Badge tone={diff <= 0 ? "good" : "warning"} icon={diff <= 0 ? "↓" : "↑"}>
            {diff > 0 ? "+" : ""}
            {diff.toFixed(2)} kg
          </Badge>
        )}
      </div>
      <p className="mt-1 text-[11px] text-zinc-400">
        desde a referencia de {referenceWeight.toFixed(2)} kg ({referenceDate})
      </p>

      <div className="mt-3 border-t border-zinc-100 pt-3">
        {trend.hasEnoughData ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">
                {TREND_ARROW[trend.direction ?? "stable"]}
              </span>
              <span className="text-sm font-medium text-zinc-900">{TREND_TEXT[trend.direction ?? "stable"]}</span>
            </div>
            <span className="text-xs text-zinc-500">
              {trend.changePerWeekKg !== null && `${trend.changePerWeekKg > 0 ? "+" : ""}${trend.changePerWeekKg.toFixed(2)} kg/semana`}
            </span>
          </div>
        ) : (
          <p className="text-xs text-zinc-400">Dados insuficientes para calcular tendencia.</p>
        )}
        {sevenDayAvg !== null && <StatRow label="Media movel (7d)" value={`${sevenDayAvg.toFixed(2)} kg`} />}
      </div>
      <p className="mt-1 text-[11px] text-zinc-400">
        Peso e composicao corporal variam naturalmente — avalie sempre pela tendencia, nunca por uma unica medida.
      </p>
    </Card>
  );
}
