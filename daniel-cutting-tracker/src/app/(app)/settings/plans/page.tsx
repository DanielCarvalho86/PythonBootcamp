import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { Card } from "@/components/dashboard/Card";
import { TogglePlanActiveButton } from "@/app/(app)/settings/plans/PlanControls";

export default async function PlansListPage() {
  const userId = await requireUserId();
  const plans = await prisma.nutritionPlan.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    include: { _count: { select: { meals: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Planos alimentares</h1>
        <Link href="/settings/plans/new" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white">
          + Nova semana (do zero)
        </Link>
      </div>

      {plans.length === 0 && <p className="text-sm text-zinc-500">Nenhum plano cadastrado.</p>}

      <div className="flex flex-col gap-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/settings/plans/${plan.id}`} className="text-sm font-semibold text-zinc-900 hover:underline">
                  {plan.name}
                </Link>
                <p className="text-xs text-zinc-500">
                  {plan.startDate.toISOString().slice(0, 10)} a {plan.endDate.toISOString().slice(0, 10)} · {plan._count.meals} refeicoes ·{" "}
                  {plan.caloriesMin}-{plan.caloriesMax} kcal
                </p>
              </div>
              <TogglePlanActiveButton planId={plan.id} active={plan.isActive} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
