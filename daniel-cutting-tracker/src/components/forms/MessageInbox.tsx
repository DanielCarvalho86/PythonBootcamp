"use client";

import { useState, useTransition } from "react";
import { submitMessageAction, type SubmitMessageState } from "@/app/(app)/log-actions";

export function MessageInbox() {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmitMessageState | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    startTransition(async () => {
      const result = await submitMessageAction(message);
      setState(result);
      if (!result.error) setMessage("");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor="inbox" className="text-sm font-semibold text-zinc-900">
          O que voce comeu ou fez hoje?
        </label>
        <textarea
          id="inbox"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Ex: Comi 200g de frango, 150g de cuscuz e 10g de azeite. Fiz musculacao 1h15, 620 kcal."
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <button
          type="submit"
          disabled={isPending || !message.trim()}
          className="self-end rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {isPending ? "Registrando..." : "Registrar"}
        </button>
      </form>

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
      )}

      {state?.result && <ResultSummary result={state.result} />}
    </div>
  );
}

function ResultSummary({ result }: { result: NonNullable<SubmitMessageState["result"]> }) {
  const { recalculation } = result;
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
      <p className="font-semibold">Registrado</p>
      <p>
        Total do dia: {round(recalculation.dayTotals.calories)} kcal · P {round(recalculation.dayTotals.protein)}g ·
        C {round(recalculation.dayTotals.carbs)}g · G {round(recalculation.dayTotals.fat)}g
      </p>
      {recalculation.adjustment && recalculation.adjustment.changes.length > 0 && (
        <div>
          <p className="font-medium">Ajustei o restante do dia:</p>
          <ul className="ml-4 list-disc">
            {recalculation.adjustment.changes.map((c) => (
              <li key={c.itemId}>
                {c.foodName} em {c.mealName}: {c.beforeGrams}g → {c.afterGrams}g
              </li>
            ))}
          </ul>
        </div>
      )}
      {recalculation.adjustment?.warnings.map((w, i) => (
        <p key={i} className="text-amber-700">
          {w}
        </p>
      ))}
      {result.unresolvedFoodItems.length > 0 && (
        <p className="text-amber-700">
          Nao encontrei no banco: {result.unresolvedFoodItems.join(", ")}. Registrado sem calculo nutricional —
          adicione o alimento em Config.
        </p>
      )}
      {result.needsClarification && <p className="text-amber-700">{result.needsClarification}</p>}
    </div>
  );
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
