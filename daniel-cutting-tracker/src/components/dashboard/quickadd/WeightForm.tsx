"use client";

import { useState, useTransition } from "react";
import { addWeightEntryAction } from "@/app/(app)/log-actions";
import { inputClass, labelClass, submitClass } from "@/components/dashboard/quickadd/shared";

const CONDITIONS = [
  { value: "fasted_on_waking", label: "Ao acordar" },
  { value: "before_training", label: "Antes do treino" },
  { value: "after_training", label: "Depois do treino" },
  { value: "other", label: "Outro" },
];

export function WeightForm({ dateStr, onDone }: { dateStr: string; onDone: () => void }) {
  const [weightKg, setWeightKg] = useState("");
  const [time, setTime] = useState("");
  const [condition, setCondition] = useState("fasted_on_waking");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<{ error?: string; success?: boolean }>({});
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(weightKg.replace(",", "."));
    if (!parsed || parsed <= 0) {
      setState({ error: "Informe um peso valido." });
      return;
    }
    startTransition(async () => {
      try {
        await addWeightEntryAction(dateStr, parsed, condition, time || undefined, notes || undefined);
        setState({ success: true });
        setTimeout(onDone, 600);
      } catch {
        setState({ error: "Erro ao salvar peso." });
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-emerald-600">Peso registrado ✓</p>}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Peso (kg)</label>
          <input value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="107,30" className={inputClass} autoFocus />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Horario</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Condicao da medicao</label>
        <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Observacao</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
      </div>
      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Salvando..." : "Salvar peso"}
      </button>
    </form>
  );
}
