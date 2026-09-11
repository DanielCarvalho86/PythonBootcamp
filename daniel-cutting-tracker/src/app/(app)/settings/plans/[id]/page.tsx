import { notFound } from "next/navigation";
import { prisma } from "@/lib/database/prisma";
import { Card } from "@/components/dashboard/Card";
import { PlanTargetsForm } from "@/app/(app)/settings/plans/PlanTargetsForm";
import { updatePlanTargetsAction } from "@/app/(app)/settings/plans/actions";
import { TogglePlanActiveButton, DeletePlanMealButton } from "@/app/(app)/settings/plans/PlanControls";
import { DuplicatePlanForm } from "@/app/(app)/settings/plans/DuplicatePlanForm";
import { PlanMealItemRow } from "@/app/(app)/settings/plans/PlanMealItemRow";
import { AddPlanMealItemForm } from "@/app/(app)/settings/plans/AddPlanMealItemForm";
import { AddPlanMealForm } from "@/app/(app)/settings/plans/AddPlanMealForm";
import { mealTypeLabel } from "@/lib/labels";
import type { FoodRole } from "@/types/domain";

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [plan, foods] = await Promise.all([
    prisma.nutritionPlan.findUnique({
      where: { id },
      include: { meals: { orderBy: { order: "asc" }, include: { items: { include: { food: true } } } } },
    }),
    prisma.food.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!plan) notFound();

  const nextOrder = plan.meals.length > 0 ? Math.max(...plan.meals.map((m) => m.order)) + 1 : 1;
  const boundUpdateTargets = updatePlanTargetsAction.bind(null, plan.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">{plan.name}</h1>
        <TogglePlanActiveButton planId={plan.id} active={plan.isActive} />
      </div>
      <DuplicatePlanForm planId={plan.id} suggestedName={nextWeekName(plan.name)} />

      <Card title="Metas do plano">
        <PlanTargetsForm
          action={boundUpdateTargets}
          submitLabel="Salvar metas"
          initial={{
            name: plan.name,
            startDate: plan.startDate.toISOString().slice(0, 10),
            endDate: plan.endDate.toISOString().slice(0, 10),
            caloriesMin: plan.caloriesMin,
            caloriesTarget: plan.caloriesTarget,
            caloriesMax: plan.caloriesMax,
            proteinMin: plan.proteinMin,
            proteinTarget: plan.proteinTarget,
            proteinMax: plan.proteinMax,
            carbsMin: plan.carbsMin,
            carbsTarget: plan.carbsTarget,
            carbsMax: plan.carbsMax,
            fatMin: plan.fatMin,
            fatTarget: plan.fatTarget,
            fatMax: plan.fatMax,
            fiberMin: plan.fiberMin,
            fiberMax: plan.fiberMax,
            waterMinMl: plan.waterMinMl,
            waterMaxMl: plan.waterMaxMl,
            creatineTargetG: plan.creatineTargetG,
            wheyTargetG: plan.wheyTargetG,
            notes: plan.notes,
          }}
        />
      </Card>

      <Card title="Refeicoes">
        <div className="flex flex-col gap-5">
          {plan.meals.map((meal) => (
            <div key={meal.id} className="rounded-lg border border-zinc-100 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {meal.name} <span className="text-xs font-normal text-zinc-400">({mealTypeLabel(meal.mealType)})</span>
                  </p>
                  <p className="mt-0.5 flex gap-2 text-[10px] text-zinc-500">
                    {meal.isProtectedComposition && <span className="text-emerald-600">composicao protegida</span>}
                    {!meal.isAdjustable && <span className="text-amber-600">nao ajustavel</span>}
                  </p>
                </div>
                <DeletePlanMealButton planMealId={meal.id} mealName={meal.name} />
              </div>

              {meal.items.map((item) => (
                <PlanMealItemRow
                  key={item.id}
                  item={{
                    id: item.id,
                    foodName: item.food.name,
                    targetQuantityG: item.targetQuantityG,
                    minQuantityG: item.minQuantityG,
                    maxQuantityG: item.maxQuantityG,
                    adjustmentStepG: item.adjustmentStepG,
                    role: item.role as FoodRole,
                    isMandatory: item.isMandatory,
                  }}
                />
              ))}

              <AddPlanMealItemForm planMealId={meal.id} foods={foods} />
            </div>
          ))}

          <AddPlanMealForm planId={plan.id} nextOrder={nextOrder} />
        </div>
      </Card>
    </div>
  );
}

function nextWeekName(currentName: string): string {
  const match = currentName.match(/(\d+)\s*$/);
  if (!match) return `${currentName} (copia)`;
  const nextNumber = Number(match[1]) + 1;
  return currentName.replace(/\d+\s*$/, String(nextNumber));
}
