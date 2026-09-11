import { Card, StatRow, Badge } from "@/components/dashboard/Card";

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

const ACTIVITY_ICONS: Record<string, string> = {
  steps: "🚶",
  weight_training: "🏋️",
  swimming: "🏊",
  walking: "🚶",
  running: "🏃",
  cycling: "🚴",
  cardio: "❤️",
  sports: "⚽",
  other: "✨",
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
        <div className="flex flex-col gap-2">
          {activities.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2.5">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="mt-0.5 text-base" aria-hidden="true">
                  {ACTIVITY_ICONS[a.activityType] ?? "•"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {ACTIVITY_LABELS[a.activityType] ?? a.activityType}
                    {a.description && a.activityType !== "steps" ? ` — ${a.description}` : ""}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {a.steps ? `${a.steps} passos · ` : ""}
                    {a.durationMinutes ? `${a.durationMinutes} min · ` : ""}
                    {a.caloriesSource === "estimated" ? "estimativa" : a.caloriesSource === "device" ? "relogio" : "usuario"}
                  </p>
                  {!a.includedInActivityTotal && (
                    <Badge tone="info" icon="ℹ">
                      Excluido do total (duplicado)
                    </Badge>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-zinc-900">{Math.round(a.caloriesBurned)} kcal</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 border-t border-zinc-100 pt-2">
        <StatRow label="Total de calorias de atividade" value={`${Math.round(totalCalories)} kcal`} />
      </div>
      {warnings.map((w, i) => (
        <p key={i} className="mt-1 flex items-start gap-1 text-xs text-amber-600">
          <span aria-hidden="true">⚠</span>
          <span>{w}</span>
        </p>
      ))}
    </Card>
  );
}
