"use client";

import { useTransition } from "react";
import { setSupplementTakenAction } from "@/app/(app)/log-actions";

export interface SupplementDefaults {
  wheyTargetG: number;
  creatineTargetG: number;
  wheyTaken: boolean;
  creatineTaken: boolean;
}

export function SupplementForm({ dateStr, defaults, onDone }: { dateStr: string; defaults: SupplementDefaults; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();

  function toggle(type: "whey" | "creatine", taken: boolean, targetGrams: number) {
    startTransition(async () => {
      await setSupplementTakenAction(dateStr, type, taken, targetGrams);
      onDone();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex min-h-[44px] items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5 text-sm">
        <span>
          Whey <span className="text-xs text-zinc-400">({defaults.wheyTargetG} g)</span>
        </span>
        <input
          type="checkbox"
          defaultChecked={defaults.wheyTaken}
          disabled={isPending}
          onChange={(e) => toggle("whey", e.target.checked, defaults.wheyTargetG)}
          className="h-4 w-4"
        />
      </label>
      <label className="flex min-h-[44px] items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5 text-sm">
        <span>
          Creatina <span className="text-xs text-zinc-400">({defaults.creatineTargetG} g)</span>
        </span>
        <input
          type="checkbox"
          defaultChecked={defaults.creatineTaken}
          disabled={isPending}
          onChange={(e) => toggle("creatine", e.target.checked, defaults.creatineTargetG)}
          className="h-4 w-4"
        />
      </label>
      <p className="text-[10px] text-zinc-400">Valores vem do plano ativo (Config → Planos).</p>
    </div>
  );
}
