import { notFound } from "next/navigation";
import { prisma } from "@/lib/database/prisma";
import { Card } from "@/components/dashboard/Card";
import { FoodForm } from "@/app/(app)/settings/foods/FoodForm";
import { updateFoodAction } from "@/app/(app)/settings/foods/actions";

export default async function EditFoodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const food = await prisma.food.findUnique({ where: { id } });
  if (!food) notFound();

  const boundAction = updateFoodAction.bind(null, food.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-zinc-900">Editar alimento</h1>
      {!food.active && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Este alimento esta desativado — continua visivel no historico, mas nao aparece para novos registros.
        </p>
      )}
      <Card>
        <FoodForm
          action={boundAction}
          submitLabel="Salvar alteracoes"
          initial={{
            name: food.name,
            category: food.category,
            servingUnit: food.servingUnit,
            gramsPerUnit: food.gramsPerUnit,
            caloriesPer100g: food.caloriesPer100g,
            proteinPer100g: food.proteinPer100g,
            carbsPer100g: food.carbsPer100g,
            fatPer100g: food.fatPer100g,
            fiberPer100g: food.fiberPer100g,
            source: food.source,
            verified: food.verified,
            notes: food.notes,
          }}
        />
      </Card>
    </div>
  );
}
