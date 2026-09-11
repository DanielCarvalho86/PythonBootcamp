import { Card } from "@/components/dashboard/Card";
import { MealEntryRow, type MealEntryRowData } from "@/components/meals/MealEntryRow";
import { calculateMealNutrition } from "@/lib/nutrition/engine";
import type { AdjustableMeal } from "@/lib/adjustment/engine";
import { mealTypeLabel } from "@/lib/labels";

export interface ConsumedEntry {
  id: string;
  foodId: string | null;
  food: { name: string } | null;
  freeTextDescription: string | null;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  isEstimated: boolean;
}

export function PlanCard({
  planMealOrder,
  consumedByMealType,
  futureMeals,
}: {
  planMealOrder: { id: string; mealType: string; name: string; order: number }[];
  consumedByMealType: Map<string, ConsumedEntry[]>;
  futureMeals: AdjustableMeal[];
}) {
  const futureByMealId = new Map(futureMeals.map((m) => [m.id, m]));

  return (
    <Card title="Plano do dia">
      <div className="flex flex-col gap-4">
        {planMealOrder.map((planMeal) => {
          const consumed = consumedByMealType.get(planMeal.mealType);
          const future = futureByMealId.get(planMeal.id);

          return (
            <div key={planMeal.id}>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {mealTypeLabel(planMeal.mealType)}
                </h3>
                <span className={`text-[10px] font-medium ${consumed ? "text-emerald-600" : "text-zinc-400"}`}>
                  {consumed ? "Consumido" : "Planejado (ajustado)"}
                </span>
              </div>

              {consumed ? (
                <div className="divide-y divide-zinc-100">
                  {consumed.map((entry) => (
                    <MealEntryRow key={entry.id} entry={toRowData(entry)} />
                  ))}
                </div>
              ) : future ? (
                <ul className="flex flex-col gap-1 text-sm text-zinc-600">
                  {future.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.foodName}</span>
                      <span className="text-zinc-400">{Math.round(item.currentGrams)}g</span>
                    </li>
                  ))}
                  <li className="flex justify-between pt-1 text-xs font-medium text-zinc-900">
                    <span>Total planejado</span>
                    <span>
                      {Math.round(
                        calculateMealNutrition(future.items.map((i) => ({ grams: i.currentGrams, facts: i.facts })))
                          .calories,
                      )}{" "}
                      kcal
                    </span>
                  </li>
                </ul>
              ) : (
                <p className="text-xs text-zinc-400">Sem plano cadastrado para esta refeicao.</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function toRowData(entry: ConsumedEntry): MealEntryRowData {
  return {
    id: entry.id,
    label: entry.food?.name ?? entry.freeTextDescription ?? "Item",
    quantity: entry.quantity,
    unit: entry.unit,
    calories: entry.calories,
    isEstimated: entry.isEstimated,
  };
}
