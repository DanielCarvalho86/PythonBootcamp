"use client";

import { useState, useTransition } from "react";
import { deleteMealEntryAction, duplicateMealEntryAction, editMealEntryAction } from "@/app/(app)/log-actions";

export interface MealEntryRowData {
  id: string;
  label: string;
  quantity: number;
  unit: string;
  calories: number;
  isEstimated: boolean;
}

export function MealEntryRow({ entry }: { entry: MealEntryRowData }) {
  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(entry.quantity);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await editMealEntryAction(entry.id, quantity);
      setEditing(false);
    });
  }

  return (
    <div className="flex items-center justify-between gap-2 py-2 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate text-zinc-900">
          {entry.label}
          {entry.isEstimated && <span className="ml-1 text-[10px] text-amber-600">(estimativa)</span>}
        </p>
        {editing ? (
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 rounded border border-zinc-300 px-2 py-1 text-xs"
              min={0}
              step="any"
            />
            <span className="text-xs text-zinc-400">{entry.unit}</span>
            <button onClick={save} disabled={isPending} className="text-xs font-medium text-emerald-600">
              Salvar
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-zinc-400">
              Cancelar
            </button>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">
            {entry.quantity} {entry.unit}
          </p>
        )}
      </div>
      <span className="whitespace-nowrap text-sm font-medium text-zinc-900">{Math.round(entry.calories)} kcal</span>
      {!editing && (
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(true)} className="text-xs text-zinc-400 hover:text-zinc-700">
            Editar
          </button>
          <button
            onClick={() => startTransition(() => duplicateMealEntryAction(entry.id))}
            disabled={isPending}
            className="text-xs text-zinc-400 hover:text-zinc-700"
          >
            Duplicar
          </button>
          <button
            onClick={() => startTransition(() => deleteMealEntryAction(entry.id))}
            disabled={isPending}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}
