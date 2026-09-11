"use client";

import { useActionState } from "react";
import { FOOD_UNITS } from "@/types/domain";
import type { FoodFormState } from "@/app/(app)/settings/foods/actions";

export interface FoodFormInitial {
  name: string;
  category: string;
  servingUnit: string;
  gramsPerUnit: number | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  source: string;
  verified: boolean;
  notes: string | null;
}

const EMPTY: FoodFormInitial = {
  name: "",
  category: "",
  servingUnit: "g",
  gramsPerUnit: null,
  caloriesPer100g: 0,
  proteinPer100g: 0,
  carbsPer100g: 0,
  fatPer100g: 0,
  fiberPer100g: 0,
  source: "manual",
  verified: false,
  notes: "",
};

export function FoodForm({
  action,
  initial = EMPTY,
  submitLabel,
}: {
  action: (prevState: FoodFormState, formData: FormData) => Promise<FoodFormState>;
  initial?: FoodFormInitial;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <Field label="Nome" name="name" defaultValue={initial.name} error={state.fieldErrors?.name} required />
      <Field label="Categoria" name="category" defaultValue={initial.category} error={state.fieldErrors?.category} required />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600">Unidade de porcao</label>
          <select
            name="servingUnit"
            defaultValue={initial.servingUnit}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            {FOOD_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Gramas por unidade"
          name="gramsPerUnit"
          type="number"
          step="any"
          defaultValue={initial.gramsPerUnit ?? ""}
          hint="Necessario quando a unidade nao e g/ml"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Kcal/100g" name="caloriesPer100g" type="number" step="any" defaultValue={initial.caloriesPer100g} required />
        <Field label="Proteina/100g" name="proteinPer100g" type="number" step="any" defaultValue={initial.proteinPer100g} required />
        <Field label="Carboidratos/100g" name="carbsPer100g" type="number" step="any" defaultValue={initial.carbsPer100g} required />
        <Field label="Gordura/100g" name="fatPer100g" type="number" step="any" defaultValue={initial.fatPer100g} required />
        <Field label="Fibras/100g" name="fiberPer100g" type="number" step="any" defaultValue={initial.fiberPer100g} required />
        <Field label="Fonte" name="source" defaultValue={initial.source} />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input type="checkbox" name="verified" defaultChecked={initial.verified} className="h-4 w-4 rounded border-zinc-300" />
        Verificado (dados conferidos em tabela oficial)
      </label>

      <Field label="Notas" name="notes" defaultValue={initial.notes ?? ""} textarea />

      <button
        type="submit"
        disabled={isPending}
        className="min-h-[44px] self-start rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  error,
  hint,
  required,
  textarea,
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
  step?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs font-medium text-zinc-600">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          rows={2}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          step={step}
          defaultValue={defaultValue}
          required={required}
          className="min-h-[44px] rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      )}
      {hint && !error && <span className="text-[11px] text-zinc-400">{hint}</span>}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
}
