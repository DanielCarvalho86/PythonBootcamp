"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoryPoint } from "@/lib/services/getHistory";

const AXIS_STYLE = { fontSize: 12 };

export function WeightChart({ data }: { data: HistoryPoint[] }) {
  const hasData = data.some((d) => d.weightKg !== null && d.weightKg !== undefined);
  return (
    <ChartFrame title="Peso e media movel (7d)" hasData={hasData}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" tick={AXIS_STYLE} tickFormatter={shortDate} />
        <YAxis tick={AXIS_STYLE} domain={["auto", "auto"]} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="weightKg" name="Peso (kg)" stroke="#18181b" strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey="weightMovingAvg7d" name="Media 7d" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 2" dot={false} connectNulls />
      </LineChart>
    </ChartFrame>
  );
}

export function CaloriesChart({ data }: { data: HistoryPoint[] }) {
  const hasData = data.some((d) => (d.calories ?? 0) > 0);
  return (
    <ChartFrame title="Calorias consumidas vs gasto estimado" hasData={hasData}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" tick={AXIS_STYLE} tickFormatter={shortDate} />
        <YAxis tick={AXIS_STYLE} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="calories" name="Consumidas" stroke="#18181b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="estimatedTdee" name="Gasto estimado" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartFrame>
  );
}

export function MacrosChart({ data }: { data: HistoryPoint[] }) {
  const hasData = data.some((d) => (d.protein ?? 0) > 0 || (d.carbs ?? 0) > 0 || (d.fat ?? 0) > 0);
  return (
    <ChartFrame title="Macronutrientes" hasData={hasData}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" tick={AXIS_STYLE} tickFormatter={shortDate} />
        <YAxis tick={AXIS_STYLE} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="protein" name="Proteina (g)" stroke="#2563eb" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="carbs" name="Carboidratos (g)" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="fat" name="Gordura (g)" stroke="#e11d48" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartFrame>
  );
}

export function ActivityChart({ data }: { data: HistoryPoint[] }) {
  const hasData = data.some((d) => (d.steps ?? 0) > 0 || (d.activityCalories ?? 0) > 0);
  return (
    <ChartFrame title="Passos e calorias de atividade" hasData={hasData}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" tick={AXIS_STYLE} tickFormatter={shortDate} />
        <YAxis yAxisId="left" tick={AXIS_STYLE} />
        <YAxis yAxisId="right" orientation="right" tick={AXIS_STYLE} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line yAxisId="left" type="monotone" dataKey="steps" name="Passos" stroke="#18181b" strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="activityCalories" name="Kcal atividade" stroke="#059669" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartFrame>
  );
}

export function BalanceChart({ data }: { data: HistoryPoint[] }) {
  const hasData = data.some((d) => (d.calories ?? 0) > 0);
  return (
    <ChartFrame title="Deficit / superavit estimado" hasData={hasData}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" tick={AXIS_STYLE} tickFormatter={shortDate} />
        <YAxis tick={AXIS_STYLE} />
        <Tooltip />
        <Line type="monotone" dataKey="balance" name="Balanco (kcal)" stroke="#7c3aed" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartFrame>
  );
}

function ChartFrame({ title, children, hasData }: { title: string; children: React.ReactElement; hasData: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-zinc-900">{title}</h2>
      {hasData ? (
        <div className="h-56 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-xl bg-zinc-50">
          <p className="text-sm text-zinc-400">Dados insuficientes para exibir este grafico.</p>
        </div>
      )}
    </div>
  );
}

function shortDate(value: string): string {
  return value.slice(5); // MM-DD
}
