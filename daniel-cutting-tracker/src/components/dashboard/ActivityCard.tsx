import { Card, StatRow } from "@/components/dashboard/Card";

const ACTIVITY_LABELS: Record<string, string> = {
  steps: "Passos",
  weight_training: "Musculacao",
  swimming: "Natacao",
  walking: "Caminhada",
  running: "Corrida",
  cycling: "Bicicleta",
  cardio: "Cardio",
  sports: "Esporte",
  other: "Outros",
};

export interface ActivitySummary {
  id: string;
  activityType: string;
  description: string | null;
  durationMinutes: number | null;
  steps: number | null;
  caloriesBurned: number;
  caloriesSource: string;
  includedInActivityTotal: boolean;
}

export function ActivityCard({ activities, totalCalories, warnings }: { activities: ActivitySummary[]; totalCalories: number; warnings: string[] }) {
  return (
    <Card title="Atividade fisica">
      {activities.length === 0 ? (
        <p className="text-sm text-zinc-400">Nenhuma atividade registrada hoje.</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-100">
          {activities.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-zinc-900">
                  {ACTIVITY_LABELS[a.activityType] ?? a.activityType}
                  {a.description && a.activityType !== "steps" ? ` — ${a.description}` : ""}
                </p>
                <p className="text-xs text-zinc-500">
                  {a.steps ? `${a.steps} passos · ` : ""}
                  {a.durationMinutes ? `${a.durationMinutes} min · ` : ""}
                  {a.caloriesSource === "estimated" ? "estimativa" : a.caloriesSource === "device" ? "relogio" : "usuario"}
                  {!a.includedInActivityTotal ? " · excluido do total (duplicado)" : ""}
                </p>
              </div>
              <span className="text-sm font-semibold text-zinc-900">{Math.round(a.caloriesBurned)} kcal</span>
            </div>
          ))}
        </div>
      )}
      <StatRow label="Total de calorias de atividade" value={`${Math.round(totalCalories)} kcal`} />
      {warnings.map((w, i) => (
        <p key={i} className="mt-1 text-xs text-amber-600">
          {w}
        </p>
      ))}
    </Card>
  );
}
