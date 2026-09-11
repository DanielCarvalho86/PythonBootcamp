"use client";

import { useState, useTransition } from "react";
import { addWaterEntryAction } from "@/app/(app)/log-actions";
import { inputClass, labelClass, submitClass } from "@/components/dashboard/quickadd/shared";

export function WaterForm({
  dateStr,
  currentMl,
  targetMl,
  onDone,
}: {
  dateStr: string;
  currentMl: number;
  targetMl: number;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState("250");
  const [state, setState] = useState<{ error?: string; success?: boolean }>({});
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      setState({ error: "Informe uma quantidade valida." });
      return;
    }
    startTransition(async () => {
      try {
        await addWaterEntryAction(dateStr, parsed);
        setState({ success: true });
        setTimeout(onDone, 500);
      } catch {
        setState({ error: "Erro ao salvar." });
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <p className="text-xs text-zinc-500">
        Progresso: {Math.round(currentMl)} / {Math.round(targetMl)} ml
      </p>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-emerald-600">Agua registrada ✓</p>}
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Quantidade (ml)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} autoFocus />
        </div>
        <div className="flex gap-1">
          {[250, 500, 750].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Salvando..." : "Adicionar agua"}
      </button>
    </form>
  );
}
