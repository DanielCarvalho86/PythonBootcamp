import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { Card, StatRow } from "@/components/dashboard/Card";

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Cafe da manha",
  morning_snack: "Lanche da manha",
  lunch: "Almoco",
  afternoon_snack: "Lanche da tarde",
  dinner: "Jantar",
  supper: "Ceia",
  other: "Shake / outro",
};

export default async function PlanPage() {
  const userId = await requireUserId();
  const plans = await prisma.nutritionPlan.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    include: { meals: { orderBy: { order: "asc" }, include: { items: { include: { food: true } } } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-zinc-900">Plano alimentar</h1>
      {plans.length === 0 && <p className="text-sm text-zinc-500">Nenhum plano cadastrado.</p>}
      {plans.map((plan) => (
        <Card key={plan.id} title={`${plan.name} (${plan.isActive ? "ativo" : "inativo"})`}>
          <p className="mb-2 text-xs text-zinc-500">
            {plan.startDate.toISOString().slice(0, 10)} a {plan.endDate.toISOString().slice(0, 10)}
          </p>
          <StatRow label="Calorias" value={`${plan.caloriesMin}-${plan.caloriesMax} kcal`} sub={`alvo ${plan.caloriesTarget}`} />
          <StatRow label="Proteina" value={`${plan.proteinMin}-${plan.proteinMax} g`} sub={`alvo ${plan.proteinTarget}`} />
          <StatRow label="Carboidratos" value={`${plan.carbsMin}-${plan.carbsMax} g`} sub={`alvo ${plan.carbsTarget}`} />
          <StatRow label="Gorduras" value={`${plan.fatMin}-${plan.fatMax} g`} sub={`alvo ${plan.fatTarget}`} />
          <StatRow label="Fibras" value={`${plan.fiberMin}-${plan.fiberMax} g`} />
          <StatRow label="Agua" value={`${plan.waterMinMl}-${plan.waterMaxMl} ml`} />
          <StatRow label="Creatina / Whey" value={`${plan.creatineTargetG}g / ${plan.wheyTargetG}g`} />
          {plan.notes && <p className="mt-2 text-xs text-zinc-500">{plan.notes}</p>}

          <div className="mt-4 flex flex-col gap-3">
            {plan.meals.map((meal) => (
              <div key={meal.id}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {MEAL_TYPE_LABELS[meal.mealType] ?? meal.name}
                  {meal.isProtectedComposition && <span className="ml-2 text-[10px] text-emerald-600">regra fixa</span>}
                </h3>
                <ul className="mt-1 flex flex-col gap-0.5 text-sm text-zinc-600">
                  {meal.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.food.name}
                        {item.isMandatory && <span className="ml-1 text-[10px] text-emerald-600">obrigatorio</span>}
                      </span>
                      <span className="text-zinc-400">
                        {item.targetQuantityG}g ({item.minQuantityG}-{item.maxQuantityG}g)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
