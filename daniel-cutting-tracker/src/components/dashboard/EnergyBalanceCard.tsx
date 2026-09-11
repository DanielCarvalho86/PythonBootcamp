import { Card, StatRow, Badge } from "@/components/dashboard/Card";

export function EnergyBalanceCard({
  bmr,
  activityCalories,
  tdee,
  consumed,
  balance,
}: {
  bmr: number;
  activityCalories: number;
  tdee: number;
  consumed: number;
  balance: number;
}) {
  const isDeficit = balance < 0;
  return (
    <Card title="Balanco energetico (estimado)">
      <StatRow label="Metabolismo basal (BMR)" value={`${Math.round(bmr)} kcal`} />
      <StatRow label="Gasto de atividade" value={`${Math.round(activityCalories)} kcal`} />
      <StatRow label="Gasto energetico estimado (TDEE)" value={`${Math.round(tdee)} kcal`} />
      <StatRow label="Calorias consumidas" value={`${Math.round(consumed)} kcal`} />
      <div className="mt-2 flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5">
        <div>
          <p className="text-xs text-zinc-500">{isDeficit ? "Deficit estimado" : "Superavit estimado"}</p>
          <p className="text-lg font-semibold text-zinc-900">
            {balance > 0 ? "+" : ""}
            {Math.round(balance)} kcal
          </p>
        </div>
        <Badge tone={isDeficit ? "good" : "warning"}>{isDeficit ? "Deficit" : "Superavit"}</Badge>
      </div>
      <p className="mt-2 text-[11px] text-zinc-400">
        Este e um valor estimado, nao uma medicao exata. Nao use as calorias de exercicio como autorizacao automatica
        para comer mais.
      </p>
    </Card>
  );
}
