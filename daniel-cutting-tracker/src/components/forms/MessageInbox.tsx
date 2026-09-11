"use client";

import { useState, useTransition } from "react";
import { submitMessageAction, type SubmitMessageState } from "@/app/(app)/log-actions";
import { Card } from "@/components/dashboard/Card";

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
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <label htmlFor="inbox" className="text-sm font-semibold text-zinc-900">
          O que voce comeu ou fez hoje?
        </label>
        <textarea
          id="inbox"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Ex: Comi 200g de frango, 150g de cuscuz e 10g de azeite. Fiz musculacao 1h15, 620 kcal."
          className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          disabled={isPending}
          aria-describedby="inbox-hint"
        />
        <p id="inbox-hint" className="text-[11px] text-zinc-400">
          Escreva em linguagem natural — o app entende quantidades, alimentos e atividades.
        </p>
        <button
          type="submit"
          disabled={isPending || !message.trim()}
          className="min-h-[44px] self-end rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Registrando..." : "Registrar"}
        </button>
      </form>

      <div aria-live="polite">
        {state?.error && (
          <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <span aria-hidden="true">✕</span>
            <span>{state.error}</span>
          </div>
        )}

        {state?.result && <ResultSummary result={state.result} />}
      </div>
    </Card>
  );
}

function ResultSummary({ result }: { result: NonNullable<SubmitMessageState["result"]> }) {
  const { recalculation } = result;
  return (
    <div className="mt-3 flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
      <p className="flex items-center gap-1 font-semibold">
        <span aria-hidden="true">✓</span> Registrado
      </p>
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
