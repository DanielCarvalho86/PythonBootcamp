"use client";

import { useState, useTransition } from "react";
import { duplicatePlanAction } from "@/app/(app)/settings/plans/actions";

export function DuplicatePlanForm({ planId, suggestedName }: { planId: string; suggestedName: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(suggestedName);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
        Duplicar como nova semana
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await duplicatePlanAction(planId, name, startDate, endDate);
          if (result?.error) setError(result.error);
        });
      }}
      className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-3"
    >
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (ex: Semana 4)" className="rounded border border-zinc-300 px-2 py-1.5 text-xs" required />
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded border border-zinc-300 px-2 py-1.5 text-xs" required />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded border border-zinc-300 px-2 py-1.5 text-xs" required />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white">
          {isPending ? "Duplicando..." : "Criar semana"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-400">
          Cancelar
        </button>
      </div>
    </form>
  );
}
