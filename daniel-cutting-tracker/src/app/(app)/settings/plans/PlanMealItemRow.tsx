"use client";

import { useState, useTransition } from "react";
import { deletePlanMealItemAction, updatePlanMealItemAction } from "@/app/(app)/settings/plans/actions";
import { FOOD_ROLES, type FoodRole } from "@/types/domain";

export interface PlanMealItemData {
  id: string;
  foodName: string;
  targetQuantityG: number;
  minQuantityG: number;
  maxQuantityG: number;
  adjustmentStepG: number;
  role: FoodRole;
  isMandatory: boolean;
}

export function PlanMealItemRow({ item }: { item: PlanMealItemData }) {
  const [values, setValues] = useState({
    targetQuantityG: item.targetQuantityG,
    minQuantityG: item.minQuantityG,
    maxQuantityG: item.maxQuantityG,
    adjustmentStepG: item.adjustmentStepG,
    role: item.role as string,
    isMandatory: item.isMandatory,
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    const fd = new FormData();
    fd.set("targetQuantityG", String(values.targetQuantityG));
    fd.set("minQuantityG", String(values.minQuantityG));
    fd.set("maxQuantityG", String(values.maxQuantityG));
    fd.set("adjustmentStepG", String(values.adjustmentStepG));
    fd.set("role", values.role);
    if (values.isMandatory) fd.set("isMandatory", "on");
    startTransition(async () => {
      const result = await updatePlanMealItemAction(item.id, fd);
      if (result.error) setError(result.error);
    });
  }

  function remove() {
    if (!window.confirm(`Remover "${item.foodName}" desta refeicao do plano?`)) return;
    startTransition(() => deletePlanMealItemAction(item.id));
  }

  return (
    <div className="flex flex-col gap-2 border-b border-zinc-100 py-2 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-900">
          {item.foodName}
          {item.isMandatory && <span className="ml-1 text-[10px] text-emerald-600">obrigatorio</span>}
        </p>
        <button onClick={remove} disabled={isPending} className="text-xs text-red-400 hover:text-red-600">
          Remover
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <NumField label="Alvo (g)" value={values.targetQuantityG} onChange={(v) => setValues((s) => ({ ...s, targetQuantityG: v }))} />
        <NumField label="Min (g)" value={values.minQuantityG} onChange={(v) => setValues((s) => ({ ...s, minQuantityG: v }))} />
        <NumField label="Max (g)" value={values.maxQuantityG} onChange={(v) => setValues((s) => ({ ...s, maxQuantityG: v }))} />
        <NumField label="Passo (g)" value={values.adjustmentStepG} onChange={(v) => setValues((s) => ({ ...s, adjustmentStepG: v }))} />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-500">Papel</label>
          <select
            value={values.role}
            onChange={(e) => setValues((s) => ({ ...s, role: e.target.value }))}
            className="rounded border border-zinc-300 px-1.5 py-1 text-xs"
          >
            {FOOD_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-xs text-zinc-600">
          <input
            type="checkbox"
            checked={values.isMandatory}
            onChange={(e) => setValues((s) => ({ ...s, isMandatory: e.target.checked }))}
            className="h-3.5 w-3.5"
          />
          Obrigatorio (nunca zerar no ajuste)
        </label>
        <button onClick={save} disabled={isPending} className="text-xs font-medium text-emerald-600 hover:text-emerald-800">
          {isPending ? "Salvando..." : "Salvar"}
        </button>
        {error && <span className="text-[10px] text-red-600">{error}</span>}
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-zinc-500">{label}</label>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded border border-zinc-300 px-1.5 py-1 text-xs"
      />
    </div>
  );
}
