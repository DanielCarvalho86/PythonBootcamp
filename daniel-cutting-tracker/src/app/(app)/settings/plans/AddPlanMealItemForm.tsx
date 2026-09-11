"use client";

import { useRef, useState, useTransition } from "react";
import { addPlanMealItemAction } from "@/app/(app)/settings/plans/actions";
import { FOOD_ROLES } from "@/types/domain";

export interface FoodOption {
  id: string;
  name: string;
}

export function AddPlanMealItemForm({ planMealId, foods }: { planMealId: string; foods: FoodOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addPlanMealItemAction(planMealId, fd);
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
      <button onClick={() => setOpen(true)} className="mt-2 text-xs font-medium text-zinc-500 hover:text-zinc-900">
        + Adicionar alimento
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2 rounded-lg bg-zinc-50 p-3">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <select name="foodId" required className="rounded border border-zinc-300 px-2 py-1.5 text-xs">
        <option value="">Selecione um alimento...</option>
        {foods.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <LabeledInput label="Alvo (g)" name="targetQuantityG" defaultValue={100} />
        <LabeledInput label="Min (g)" name="minQuantityG" defaultValue={50} />
        <LabeledInput label="Max (g)" name="maxQuantityG" defaultValue={200} />
        <LabeledInput label="Passo (g)" name="adjustmentStepG" defaultValue={10} />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500">Papel</label>
          <select name="role" className="rounded border border-zinc-300 px-1.5 py-1 text-xs">
            {FOOD_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-1 text-xs text-zinc-600">
        <input type="checkbox" name="isMandatory" className="h-3.5 w-3.5" />
        Obrigatorio
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white">
          {isPending ? "Adicionando..." : "Adicionar"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-400">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function LabeledInput({ label, name, defaultValue }: { label: string; name: string; defaultValue: number }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-zinc-500">{label}</label>
      <input name={name} type="number" step="any" defaultValue={defaultValue} className="w-full rounded border border-zinc-300 px-1.5 py-1 text-xs" />
    </div>
  );
}
