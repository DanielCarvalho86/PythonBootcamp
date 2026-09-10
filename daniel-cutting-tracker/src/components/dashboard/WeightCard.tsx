import { Card, StatRow } from "@/components/dashboard/Card";

export function WeightCard({
  currentWeight,
  referenceWeight,
  referenceDate,
  sevenDayAvg,
}: {
  currentWeight: number | null;
  referenceWeight: number;
  referenceDate: string;
  sevenDayAvg: number | null;
}) {
  const weight = currentWeight ?? referenceWeight;
  const diff = Math.round((weight - referenceWeight) * 100) / 100;

  return (
    <Card>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-zinc-500">Peso atual</p>
          <p className="text-3xl font-semibold text-zinc-900">{weight.toFixed(2)} kg</p>
        </div>
        <div className="text-right text-xs text-zinc-500">
          <p>
            Ref: {referenceWeight.toFixed(2)} kg ({referenceDate})
          </p>
          <p className={diff <= 0 ? "text-emerald-600" : "text-amber-600"}>
            {diff > 0 ? "+" : ""}
            {diff.toFixed(2)} kg
          </p>
        </div>
      </div>
      {sevenDayAvg !== null && <StatRow label="Media movel (7d)" value={`${sevenDayAvg.toFixed(2)} kg`} />}
      <p className="mt-1 text-[11px] text-zinc-400">
        Peso e composicao corporal variam naturalmente — avalie sempre pela tendencia, nunca por uma unica medida.
      </p>
    </Card>
  );
}
