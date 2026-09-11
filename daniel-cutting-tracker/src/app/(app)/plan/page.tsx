import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { Card, StatRow, Badge } from "@/components/dashboard/Card";
import { AccordionItem } from "@/components/dashboard/Accordion";
import { mealTypeLabel } from "@/lib/labels";

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
      {plans.length === 0 && (
        <p className="rounded-xl border border-zinc-100 bg-white p-4 text-sm text-zinc-400">Nenhum plano cadastrado.</p>
      )}
      {plans.map((plan) => (
        <Card key={plan.id}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">{plan.name}</h2>
            <Badge tone={plan.isActive ? "good" : "neutral"}>{plan.isActive ? "Ativo" : "Inativo"}</Badge>
          </div>
          <p className="mb-3 text-xs text-zinc-500">
            {plan.startDate.toISOString().slice(0, 10)} a {plan.endDate.toISOString().slice(0, 10)}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0 sm:grid-cols-3">
            <StatRow label="Calorias" value={`${plan.caloriesMin}-${plan.caloriesMax}`} sub="kcal" />
            <StatRow label="Proteina" value={`${plan.proteinMin}-${plan.proteinMax}`} sub="g" />
            <StatRow label="Carboidratos" value={`${plan.carbsMin}-${plan.carbsMax}`} sub="g" />
            <StatRow label="Gorduras" value={`${plan.fatMin}-${plan.fatMax}`} sub="g" />
            <StatRow label="Fibras" value={`${plan.fiberMin}-${plan.fiberMax}`} sub="g" />
            <StatRow label="Agua" value={`${plan.waterMinMl}-${plan.waterMaxMl}`} sub="ml" />
            <StatRow label="Creatina" value={`${plan.creatineTargetG}g`} />
            <StatRow label="Whey" value={`${plan.wheyTargetG}g`} />
          </div>
          {plan.notes && <p className="mt-2 text-xs text-zinc-500">{plan.notes}</p>}

          <div className="mt-4 flex flex-col gap-2">
            {plan.meals.map((meal) => {
              const isShake = meal.mealType === "shake";
              const title = isShake ? "Shake" : mealTypeLabel(meal.mealType);
              return (
                <AccordionItem
                  key={meal.id}
                  title={title}
                  badge={
                    meal.isProtectedComposition ? (
                      <Badge tone="info" icon="🔒">
                        {isShake ? "SHAKE — REGRA FIXA" : "REGRA FIXA"}
                      </Badge>
                    ) : undefined
                  }
                  subtitle={<span className="text-xs text-zinc-400">{meal.items.length} itens</span>}
                >
                  <ul className="flex flex-col gap-1.5 text-sm text-zinc-700">
                    {meal.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate">{item.food.name}</span>
                          {item.isMandatory && (
                            <span className="shrink-0 text-[10px] font-medium text-emerald-600">obrigatorio</span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-zinc-400">
                          {item.targetQuantityG}g ({item.minQuantityG}-{item.maxQuantityG}g)
                        </span>
                      </li>
                    ))}
                  </ul>
                  {meal.isProtectedComposition && (
                    <p className="mt-3 rounded-lg bg-blue-50 px-2.5 py-2 text-[11px] text-blue-700">
                      Composicao fixa: 5 componentes obrigatorios (whey, fruta, leite desnatado, aveia, castanhas) +
                      creatina. O sistema pode ajustar quantidades, mas nunca remove ou zera um componente.
                    </p>
                  )}
                </AccordionItem>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
