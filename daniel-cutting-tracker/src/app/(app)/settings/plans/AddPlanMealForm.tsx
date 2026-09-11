"use client";

import { useRef, useState, useTransition } from "react";
import { addPlanMealAction } from "@/app/(app)/settings/plans/actions";
import { MEAL_TYPES } from "@/types/domain";
import { mealTypeLabel } from "@/lib/labels";

export function AddPlanMealForm({ planId, nextOrder }: { planId: string; nextOrder: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addPlanMealAction(planId, fd);
      if (result.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-zinc-600 hover:text-zinc-900">
        + Adicionar refeicao ao plano
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-3">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500">Slot (mealType)</label>
          <select name="mealType" className="rounded border border-zinc-300 px-2 py-1.5 text-xs">
            {MEAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {mealTypeLabel(t)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500">Nome de exibicao</label>
          <input name="name" required placeholder="Ex: Lanche pos-treino" className="rounded border border-zinc-300 px-2 py-1.5 text-xs" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-zinc-500">Ordem no dia</label>
        <input name="order" type="number" defaultValue={nextOrder} className="w-24 rounded border border-zinc-300 px-2 py-1.5 text-xs" />
      </div>
      <label className="flex items-center gap-1 text-xs text-zinc-600">
        <input type="checkbox" name="isProtectedComposition" className="h-3.5 w-3.5" />
        Composicao protegida (ex: shake — itens obrigatorios nunca zerados)
      </label>
      <label className="flex items-center gap-1 text-xs text-zinc-600">
        <input type="checkbox" name="isAdjustable" defaultChecked className="h-3.5 w-3.5" />
        Ajustavel pelo motor de otimizacao
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white">
          {isPending ? "Adicionando..." : "Adicionar refeicao"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-400">
          Cancelar
        </button>
      </div>
    </form>
  );
}
