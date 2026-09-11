"use client";

import { useState, useTransition } from "react";
import { addManualMealEntryAction } from "@/app/(app)/quick-add-actions";
import { inputClass, labelClass, submitClass } from "@/components/dashboard/quickadd/shared";
import { MEAL_TYPES, type FoodUnit, type MealType } from "@/types/domain";
import { mealTypeLabel } from "@/lib/labels";

export interface FoodOption {
  id: string;
  name: string;
}

interface Row {
  foodId: string;
  quantity: string;
  unit: FoodUnit;
}

function emptyRow(firstFoodId: string): Row {
  return { foodId: firstFoodId, quantity: "", unit: "g" };
}

export function MealForm({ dateStr, foods, onDone }: { dateStr: string; foods: FoodOption[]; onDone: () => void }) {
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [rows, setRows] = useState<Row[]>([emptyRow(foods[0]?.id ?? "")]);
  const [state, setState] = useState<{ error?: string; success?: boolean }>({});
  const [isPending, startTransition] = useTransition();

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const items = rows
      .filter((r) => r.foodId && r.quantity.trim())
      .map((r) => ({ foodId: r.foodId, quantity: Number(r.quantity.replace(",", ".")), unit: r.unit }));

    if (items.length === 0) {
      setState({ error: "Adicione pelo menos um alimento com quantidade." });
      return;
    }

    startTransition(async () => {
      const result = await addManualMealEntryAction(dateStr, mealType, items);
      if (result.error) setState({ error: result.error });
      else {
        setState({ success: true });
        setTimeout(onDone, 600);
      }
    });
  }

  if (foods.length === 0) {
    return <p className="text-xs text-zinc-400">Nenhum alimento ativo cadastrado — adicione um em Config → Alimentos.</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-emerald-600">Refeicao registrada ✓</p>}

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Refeicao</label>
        <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className={inputClass}>
          {MEAL_TYPES.map((t) => (
            <option key={t} value={t}>
              {mealTypeLabel(t)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_70px_70px_auto] items-end gap-1">
            <div className="flex flex-col gap-1">
              {i === 0 && <label className={labelClass}>Alimento</label>}
              <select value={row.foodId} onChange={(e) => updateRow(i, { foodId: e.target.value })} className={inputClass}>
                {foods.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              {i === 0 && <label className={labelClass}>Qtd</label>}
              <input value={row.quantity} onChange={(e) => updateRow(i, { quantity: e.target.value })} placeholder="100" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              {i === 0 && <label className={labelClass}>Un.</label>}
              <select value={row.unit} onChange={(e) => updateRow(i, { unit: e.target.value as FoodUnit })} className={inputClass}>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="unit">unid</option>
                <option value="slice">fatia</option>
                <option value="tbsp">colher</option>
                <option value="cup">xicara</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
              disabled={rows.length === 1}
              className="pb-1.5 text-xs text-red-400 disabled:opacity-30"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, emptyRow(foods[0]?.id ?? "")])}
        className="self-start text-xs text-zinc-500 hover:text-zinc-900"
      >
        + Adicionar outro alimento
      </button>

      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Salvando..." : "Registrar refeicao"}
      </button>
    </form>
  );
}
