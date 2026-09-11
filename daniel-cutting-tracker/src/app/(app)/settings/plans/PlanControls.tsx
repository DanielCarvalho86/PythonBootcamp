"use client";

import { useState, useTransition } from "react";
import { deletePlanMealAction, setPlanActiveAction } from "@/app/(app)/settings/plans/actions";

export function TogglePlanActiveButton({ planId, active }: { planId: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => setPlanActiveAction(planId, !active))}
      disabled={isPending}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
      }`}
    >
      {active ? "Ativo (clique para desativar)" : "Inativo (clique para ativar)"}
    </button>
  );
}

export function DeletePlanMealButton({ planMealId, mealName }: { planMealId: string; mealName: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-xs text-red-400 hover:text-red-600">
        Excluir refeicao
      </button>
    );
  }

  return (
    <span className="text-xs text-red-600">
      Excluir &quot;{mealName}&quot; e todos os itens?{" "}
      <button
        onClick={() => startTransition(() => deletePlanMealAction(planMealId))}
        disabled={isPending}
        className="ml-1 font-semibold underline"
      >
        Confirmar
      </button>{" "}
      <button onClick={() => setConfirming(false)} className="ml-1 text-zinc-400">
        Cancelar
      </button>
    </span>
  );
}
