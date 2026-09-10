import { Card, ProgressBar } from "@/components/dashboard/Card";
import type { NutrientTotals } from "@/types/domain";
import type { PlanTargets } from "@/lib/adjustment/engine";

export function NutritionCard({ consumed, targets }: { consumed: NutrientTotals; targets: PlanTargets | null }) {
  const remainingCalories = targets ? Math.round(targets.caloriesTarget - consumed.calories) : null;

  return (
    <Card title="Calorias e macros">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-2xl font-semibold text-zinc-900">{Math.round(consumed.calories)} kcal</span>
        {targets && (
          <span className="text-xs text-zinc-500">
            meta {targets.caloriesMin}-{targets.caloriesMax} · restam {remainingCalories} kcal
          </span>
        )}
      </div>
      {targets && <ProgressBar value={consumed.calories} max={targets.caloriesMax} colorClassName="bg-zinc-900" />}

      <div className="mt-4 flex flex-col gap-3">
        <Macro label="Proteina" value={consumed.protein} min={targets?.proteinMin} max={targets?.proteinMax} color="bg-blue-600" />
        <Macro label="Carboidratos" value={consumed.carbs} min={targets?.carbsMin} max={targets?.carbsMax} color="bg-amber-500" />
        <Macro label="Gorduras" value={consumed.fat} min={targets?.fatMin} max={targets?.fatMax} color="bg-rose-500" />
        <Macro label="Fibras" value={consumed.fiber} min={targets?.fiberMin} max={undefined} color="bg-emerald-600" />
      </div>
    </Card>
  );
}

function Macro({ label, value, min, max, color }: { label: string; value: number; min?: number; max?: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="font-medium text-zinc-900">
          {Math.round(value)}g{min !== undefined && max !== undefined ? ` / ${min}-${max}g` : min !== undefined ? ` / min ${min}g` : ""}
        </span>
      </div>
      <ProgressBar value={value} max={max ?? min ?? (value || 1)} colorClassName={color} />
    </div>
  );
}
