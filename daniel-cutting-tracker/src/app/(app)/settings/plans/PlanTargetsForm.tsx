"use client";

import { useActionState } from "react";
import type { PlanFormState } from "@/app/(app)/settings/plans/actions";

export interface PlanTargetsInitial {
  name: string;
  startDate: string; // yyyy-MM-dd
  endDate: string;
  caloriesMin: number;
  caloriesTarget: number;
  caloriesMax: number;
  proteinMin: number;
  proteinTarget: number;
  proteinMax: number;
  carbsMin: number;
  carbsTarget: number;
  carbsMax: number;
  fatMin: number;
  fatTarget: number;
  fatMax: number;
  fiberMin: number;
  fiberMax: number;
  waterMinMl: number;
  waterMaxMl: number;
  creatineTargetG: number;
  wheyTargetG: number;
  notes: string | null;
}

export function PlanTargetsForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prevState: PlanFormState, formData: FormData) => Promise<PlanFormState>;
  initial: PlanTargetsInitial;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Nome" name="name" defaultValue={initial.name} required />
        <Field label="Inicio" name="startDate" type="date" defaultValue={initial.startDate} required />
        <Field label="Fim" name="endDate" type="date" defaultValue={initial.endDate} required />
      </div>

      <RangeFields label="Calorias (kcal)" prefix="calories" min={initial.caloriesMin} target={initial.caloriesTarget} max={initial.caloriesMax} />
      <RangeFields label="Proteina (g)" prefix="protein" min={initial.proteinMin} target={initial.proteinTarget} max={initial.proteinMax} />
      <RangeFields label="Carboidratos (g)" prefix="carbs" min={initial.carbsMin} target={initial.carbsTarget} max={initial.carbsMax} />
      <RangeFields label="Gordura (g)" prefix="fat" min={initial.fatMin} target={initial.fatTarget} max={initial.fatMax} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Fibra min (g)" name="fiberMin" type="number" step="any" defaultValue={initial.fiberMin} />
        <Field label="Fibra max (g)" name="fiberMax" type="number" step="any" defaultValue={initial.fiberMax} />
        <Field label="Agua min (ml)" name="waterMinMl" type="number" step="any" defaultValue={initial.waterMinMl} />
        <Field label="Agua max (ml)" name="waterMaxMl" type="number" step="any" defaultValue={initial.waterMaxMl} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Creatina (g/dia)" name="creatineTargetG" type="number" step="any" defaultValue={initial.creatineTargetG} />
        <Field label="Whey (g/dia)" name="wheyTargetG" type="number" step="any" defaultValue={initial.wheyTargetG} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-xs font-medium text-zinc-600">
          Notas
        </label>
        <textarea id="notes" name="notes" defaultValue={initial.notes ?? ""} rows={2} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {isPending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}

function RangeFields({ label, prefix, min, target, max }: { label: string; prefix: string; min: number; target: number; max: number }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-zinc-600">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Min" name={`${prefix}Min`} type="number" step="any" defaultValue={min} />
        <Field label="Alvo" name={`${prefix}Target`} type="number" step="any" defaultValue={target} />
        <Field label="Max" name={`${prefix}Max`} type="number" step="any" defaultValue={max} />
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-[11px] text-zinc-500">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
      />
    </div>
  );
}
