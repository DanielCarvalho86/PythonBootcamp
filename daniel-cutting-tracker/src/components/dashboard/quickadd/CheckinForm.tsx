"use client";

import { useState, useTransition } from "react";
import { setDailyCheckinAction } from "@/app/(app)/quick-add-actions";
import { labelClass, submitClass } from "@/components/dashboard/quickadd/shared";

const SCALE = [1, 2, 3, 4, 5];

function ScalePicker({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>{label} (1-5)</label>
      <div className="flex gap-1">
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-8 w-8 rounded-full text-xs font-medium ${
              value === n ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CheckinForm({ dateStr, onDone }: { dateStr: string; onDone: () => void }) {
  const [hunger, setHunger] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [performance, setPerformance] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await setDailyCheckinAction(dateStr, {
        hunger: hunger ?? undefined,
        energy: energy ?? undefined,
        trainingPerformance: performance ?? undefined,
      });
      setSuccess(true);
      setTimeout(onDone, 500);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <p className="text-[11px] text-zinc-400">
        Usado apenas para observar padroes ao longo do tempo (alertas de energia/fome/desempenho). Nunca reduz sua dieta automaticamente.
      </p>
      {success && <p className="text-xs text-emerald-600">Check-in salvo ✓</p>}
      <ScalePicker label="Fome" value={hunger} onChange={setHunger} />
      <ScalePicker label="Energia" value={energy} onChange={setEnergy} />
      <ScalePicker label="Desempenho no treino" value={performance} onChange={setPerformance} />
      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Salvando..." : "Salvar check-in"}
      </button>
    </form>
  );
}
