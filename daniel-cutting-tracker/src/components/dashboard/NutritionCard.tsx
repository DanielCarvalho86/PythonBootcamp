import { Card, ProgressBar, RangeBar, Badge, rangeStatusLabel } from "@/components/dashboard/Card";
import type { NutrientTotals } from "@/types/domain";
import type { PlanTargets } from "@/lib/adjustment/engine";

export function NutritionCard({ consumed, targets }: { consumed: NutrientTotals; targets: PlanTargets | null }) {
  const remainingCalories = targets ? Math.round(targets.caloriesTarget - consumed.calories) : null;
  const caloriesStatus = targets ? rangeStatusLabel(consumed.calories, targets.caloriesMin, targets.caloriesMax) : null;

  return (
    <Card title="Calorias e macros">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold text-zinc-900">{Math.round(consumed.calories)} kcal</span>
        {targets && (
          <span className="text-right text-xs text-zinc-500">
            meta {targets.caloriesMin}-{targets.caloriesMax} · restam {remainingCalories} kcal
          </span>
        )}
      </div>
      {targets && caloriesStatus && (
        <>
          <div className="mb-1">
            <RangeBar value={consumed.calories} min={targets.caloriesMin} max={targets.caloriesMax} />
          </div>
          <Badge tone={caloriesStatus.tone} icon={caloriesStatus.tone === "good" ? "✓" : undefined}>
            {caloriesStatus.text}
          </Badge>
        </>
      )}
      {!targets && <ProgressBar value={consumed.calories} max={consumed.calories || 1} colorClassName="bg-zinc-900" />}

      <div className="mt-4 flex flex-col gap-3">
        <Macro label="Proteina" value={consumed.protein} min={targets?.proteinMin} max={targets?.proteinMax} tone="blue" />
        <Macro label="Carboidratos" value={consumed.carbs} min={targets?.carbsMin} max={targets?.carbsMax} tone="amber" />
        <Macro label="Gorduras" value={consumed.fat} min={targets?.fatMin} max={targets?.fatMax} tone="rose" />
        <Macro label="Fibras" value={consumed.fiber} min={targets?.fiberMin} max={undefined} tone="emerald" />
      </div>
    </Card>
  );
}

const MACRO_COLORS: Record<string, string> = {
  blue: "bg-blue-600",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-600",
};

function Macro({ label, value, min, max, tone }: { label: string; value: number; min?: number; max?: number; tone: string }) {
  const hasTarget = min !== undefined || max !== undefined;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="text-zinc-500">{label}</span>
        <span className="font-medium text-zinc-900">
          {Math.round(value)}g{min !== undefined && max !== undefined ? ` / ${min}-${max}g` : min !== undefined ? ` / min ${min}g` : ""}
        </span>
      </div>
      {hasTarget ? (
        <RangeBar value={value} min={min} max={max} />
      ) : (
        <ProgressBar value={value} max={value || 1} colorClassName={MACRO_COLORS[tone]} />
      )}
    </div>
  );
}
