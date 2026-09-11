import { Card, Badge } from "@/components/dashboard/Card";
import { AccordionItem } from "@/components/dashboard/Accordion";
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
      <div className="flex flex-col gap-2">
        {planMealOrder.map((planMeal) => {
          const consumed = consumedByMealType.get(planMeal.mealType);
          const future = futureByMealId.get(planMeal.id);
          const isShake = planMeal.mealType === "shake";
          const isProtected = isShake || future?.isProtectedComposition === true;

          return (
            <AccordionItem
              key={planMeal.id}
              title={isShake ? "Shake" : mealTypeLabel(planMeal.mealType)}
              defaultOpen={Boolean(consumed)}
              badge={
                isProtected ? (
                  <Badge tone="info" icon="🔒">
                    {isShake ? "SHAKE — REGRA FIXA" : "REGRA FIXA"}
                  </Badge>
                ) : undefined
              }
              subtitle={
                <Badge tone={consumed ? "good" : "neutral"} icon={consumed ? "✓" : undefined}>
                  {consumed ? "Consumido" : "Planejado"}
                </Badge>
              }
            >
              {consumed ? (
                <div className="divide-y divide-zinc-100">
                  {consumed.map((entry) => (
                    <MealEntryRow key={entry.id} entry={toRowData(entry)} />
                  ))}
                </div>
              ) : future ? (
                <>
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
                  {isProtected && (
                    <p className="mt-3 rounded-lg bg-blue-50 px-2.5 py-2 text-[11px] text-blue-700">
                      Composicao fixa: 5 componentes obrigatorios (whey, fruta, leite desnatado, aveia, castanhas) +
                      creatina. O sistema pode ajustar quantidades, mas nunca remove ou zera um componente.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-zinc-400">Sem plano cadastrado para esta refeicao.</p>
              )}
            </AccordionItem>
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
