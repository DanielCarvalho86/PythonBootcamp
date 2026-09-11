"use client";

import { useState, useTransition } from "react";
import { addOrUpdateStepsAction } from "@/app/(app)/quick-add-actions";
import { inputClass, labelClass, submitClass } from "@/components/dashboard/quickadd/shared";
import type { CaloriesSource } from "@/types/domain";

const SOURCES: { value: CaloriesSource; label: string }[] = [
  { value: "device", label: "Relogio" },
  { value: "user", label: "Celular / Manual" },
  { value: "estimated", label: "Estimativa" },
];

export function StepsForm({ dateStr, onDone }: { dateStr: string; onDone: () => void }) {
  const [steps, setSteps] = useState("");
  const [calories, setCalories] = useState("");
  const [source, setSource] = useState<CaloriesSource>("device");
  const [state, setState] = useState<{ error?: string; success?: boolean }>({});
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const stepsNum = Number(steps);
    if (!stepsNum || stepsNum <= 0) {
      setState({ error: "Informe a quantidade de passos." });
      return;
    }
    const caloriesNum = calories.trim() ? Number(calories) : undefined;
    startTransition(async () => {
      try {
        const result = await addOrUpdateStepsAction(dateStr, stepsNum, caloriesNum, source);
        if (result.error) setState({ error: result.error });
        else {
          setState({ success: true });
          setTimeout(onDone, 500);
        }
      } catch {
        setState({ error: "Erro ao salvar." });
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-emerald-600">Passos registrados ✓</p>}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Passos</label>
          <input value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="9500" className={inputClass} autoFocus />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Calorias gastas (opcional)</label>
          <input value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="380" className={inputClass} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Fonte</label>
        <select value={source} onChange={(e) => setSource(e.target.value as CaloriesSource)} className={inputClass}>
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {!calories.trim() && <p className="text-[10px] text-zinc-400">Sem calorias informadas, o gasto sera estimado.</p>}
      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Salvando..." : "Salvar passos"}
      </button>
    </form>
  );
}
