"use client";

import { useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { WeightForm } from "@/components/dashboard/quickadd/WeightForm";
import { WaterForm } from "@/components/dashboard/quickadd/WaterForm";
import { StepsForm } from "@/components/dashboard/quickadd/StepsForm";
import { ActivityForm } from "@/components/dashboard/quickadd/ActivityForm";
import { MealForm, type FoodOption } from "@/components/dashboard/quickadd/MealForm";
import { SupplementForm, type SupplementDefaults } from "@/components/dashboard/quickadd/SupplementForm";
import { CheckinForm } from "@/components/dashboard/quickadd/CheckinForm";

type Mode = "weight" | "meal" | "steps" | "weight_training" | "swimming" | "other_activity" | "water" | "supplement" | "checkin" | null;

const BUTTONS: { mode: Mode; label: string; icon: string }[] = [
  { mode: "weight", label: "Peso", icon: "⚖️" },
  { mode: "meal", label: "Refeicao", icon: "🍽️" },
  { mode: "steps", label: "Passos", icon: "🚶" },
  { mode: "weight_training", label: "Musculacao", icon: "🏋️" },
  { mode: "swimming", label: "Natacao", icon: "🏊" },
  { mode: "other_activity", label: "Outra atividade", icon: "✨" },
  { mode: "water", label: "Agua", icon: "💧" },
  { mode: "supplement", label: "Suplemento", icon: "💊" },
  { mode: "checkin", label: "Check-in", icon: "📋" },
];

export function QuickAddBar({
  dateStr,
  foods,
  supplementDefaults,
  waterCurrentMl,
  waterTargetMl,
}: {
  dateStr: string;
  foods: FoodOption[];
  supplementDefaults: SupplementDefaults;
  waterCurrentMl: number;
  waterTargetMl: number;
}) {
  const [mode, setMode] = useState<Mode>(null);

  function close() {
    setMode(null);
  }

  return (
    <Card title="Adicionar rapido">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
        {BUTTONS.map((b) => (
          <button
            key={b.mode}
            type="button"
            onClick={() => setMode(mode === b.mode ? null : b.mode)}
            aria-pressed={mode === b.mode}
            className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-center text-[11px] font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
              mode === b.mode ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 active:bg-zinc-200"
            }`}
          >
            <span className="text-lg" aria-hidden="true">
              {b.icon}
            </span>
            {b.label}
          </button>
        ))}
      </div>

      {mode && (
        <div className="mt-3 border-t border-zinc-100 pt-3">
          {mode === "weight" && <WeightForm dateStr={dateStr} onDone={close} />}
          {mode === "meal" && (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-zinc-400">
                Prefere descrever em texto? Use o campo &quot;O que voce comeu ou fez hoje?&quot; acima em vez deste formulario.
              </p>
              <MealForm dateStr={dateStr} foods={foods} onDone={close} />
            </div>
          )}
          {mode === "steps" && <StepsForm dateStr={dateStr} onDone={close} />}
          {mode === "weight_training" && <ActivityForm variant="weight_training" dateStr={dateStr} onDone={close} />}
          {mode === "swimming" && <ActivityForm variant="swimming" dateStr={dateStr} onDone={close} />}
          {mode === "other_activity" && <ActivityForm variant="other" dateStr={dateStr} onDone={close} />}
          {mode === "water" && <WaterForm dateStr={dateStr} currentMl={waterCurrentMl} targetMl={waterTargetMl} onDone={close} />}
          {mode === "supplement" && <SupplementForm dateStr={dateStr} defaults={supplementDefaults} onDone={close} />}
          {mode === "checkin" && <CheckinForm dateStr={dateStr} onDone={close} />}
        </div>
      )}
    </Card>
  );
}
