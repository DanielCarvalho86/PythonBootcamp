"use client";

import { useState, useTransition } from "react";
import { setFoodActiveAction } from "@/app/(app)/settings/foods/actions";

export function ToggleActiveButton({ foodId, active }: { foodId: string; active: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (active) {
      const confirmed = window.confirm(
        "Desativar este alimento?\n\nEle nao sera usado em novos registros, mas continuara preservado no historico.",
      );
      if (!confirmed) return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setFoodActiveAction(foodId, !active);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        disabled={isPending}
        className={`text-xs font-medium ${active ? "text-red-500 hover:text-red-700" : "text-emerald-600 hover:text-emerald-800"}`}
      >
        {active ? "Desativar" : "Reativar"}
      </button>
      {error && <span className="max-w-[220px] text-right text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
