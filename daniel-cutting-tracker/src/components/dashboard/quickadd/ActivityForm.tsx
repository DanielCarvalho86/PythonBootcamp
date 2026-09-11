"use client";

import { useState, useTransition } from "react";
import { addManualActivityAction } from "@/app/(app)/quick-add-actions";
import { inputClass, labelClass, submitClass } from "@/components/dashboard/quickadd/shared";
import type { ActivityType, CaloriesSource } from "@/types/domain";

const SOURCES: { value: CaloriesSource; label: string }[] = [
  { value: "device", label: "Relogio" },
  { value: "user", label: "Manual" },
  { value: "estimated", label: "Estimativa" },
];

const INTENSITIES = ["baixa", "moderada", "alta"];

const OTHER_ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "walking", label: "Caminhada" },
  { value: "running", label: "Corrida" },
  { value: "cycling", label: "Bicicleta" },
  { value: "cardio", label: "Cardio" },
  { value: "sports", label: "Esporte" },
  { value: "other", label: "Outro" },
];

export function ActivityForm({
  variant,
  dateStr,
  onDone,
}: {
  variant: "weight_training" | "swimming" | "other";
  dateStr: string;
  onDone: () => void;
}) {
  const [activityType, setActivityType] = useState<ActivityType>(variant === "other" ? "walking" : variant);
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [calories, setCalories] = useState("");
  const [source, setSource] = useState<CaloriesSource>("user");
  const [intensity, setIntensity] = useState("moderada");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<{ error?: string; success?: boolean }>({});
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const result = await addManualActivityAction(dateStr, variant === "other" ? activityType : variant, {
          description: description || undefined,
          durationMinutes: duration ? Number(duration) : undefined,
          distanceKm: distance ? Number(distance) : undefined,
          caloriesBurned: calories ? Number(calories) : undefined,
          caloriesSource: source,
          intensity: intensity || undefined,
          notes: notes || undefined,
        });
        if (result.error) setState({ error: result.error });
        else {
          setState({ success: true });
          setTimeout(onDone, 500);
        }
      } catch {
        setState({ error: "Erro ao salvar atividade." });
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-emerald-600">Atividade registrada ✓</p>}

      {variant === "other" && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Tipo</label>
          <select value={activityType} onChange={(e) => setActivityType(e.target.value as ActivityType)} className={inputClass}>
            {OTHER_ACTIVITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className={labelClass}>{variant === "weight_training" ? "Grupo muscular" : variant === "swimming" ? "Estilo" : "Descricao"}</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={variant === "weight_training" ? "Peito + ombro + triceps" : variant === "swimming" ? "Nado livre" : "Futebol"}
          className={inputClass}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Duracao (min)</label>
          <input value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} />
        </div>
        {variant === "swimming" ? (
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Distancia (km)</label>
            <input value={distance} onChange={(e) => setDistance(e.target.value)} className={inputClass} />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Calorias</label>
            <input value={calories} onChange={(e) => setCalories(e.target.value)} className={inputClass} />
          </div>
        )}
      </div>
      {variant === "swimming" && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Calorias</label>
          <input value={calories} onChange={(e) => setCalories(e.target.value)} className={inputClass} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Fonte</label>
          <select value={source} onChange={(e) => setSource(e.target.value as CaloriesSource)} className={inputClass}>
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Intensidade</label>
          <select value={intensity} onChange={(e) => setIntensity(e.target.value)} className={inputClass}>
            {INTENSITIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Observacoes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
      </div>

      <button type="submit" disabled={isPending} className={submitClass}>
        {isPending ? "Salvando..." : "Salvar atividade"}
      </button>
    </form>
  );
}
