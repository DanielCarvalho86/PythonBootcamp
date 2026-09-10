"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoryPoint } from "@/lib/services/getHistory";

const AXIS_STYLE = { fontSize: 11 };

export function WeightChart({ data }: { data: HistoryPoint[] }) {
  return (
    <ChartFrame title="Peso e media movel (7d)">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" tick={AXIS_STYLE} tickFormatter={shortDate} />
        <YAxis tick={AXIS_STYLE} domain={["auto", "auto"]} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="weightKg" name="Peso (kg)" stroke="#18181b" dot={false} connectNulls />
        <Line type="monotone" dataKey="weightMovingAvg7d" name="Media 7d" stroke="#2563eb" strokeDasharray="4 2" dot={false} connectNulls />
      </LineChart>
    </ChartFrame>
  );
}

export function CaloriesChart({ data }: { data: HistoryPoint[] }) {
  return (
    <ChartFrame title="Calorias consumidas vs gasto estimado">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" tick={AXIS_STYLE} tickFormatter={shortDate} />
        <YAxis tick={AXIS_STYLE} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="calories" name="Consumidas" stroke="#18181b" dot={false} />
        <Line type="monotone" dataKey="estimatedTdee" name="Gasto estimado" stroke="#f59e0b" dot={false} />
      </LineChart>
    </ChartFrame>
  );
}

export function MacrosChart({ data }: { data: HistoryPoint[] }) {
  return (
    <ChartFrame title="Macronutrientes">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" tick={AXIS_STYLE} tickFormatter={shortDate} />
        <YAxis tick={AXIS_STYLE} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="protein" name="Proteina (g)" stroke="#2563eb" dot={false} />
        <Line type="monotone" dataKey="carbs" name="Carboidratos (g)" stroke="#f59e0b" dot={false} />
        <Line type="monotone" dataKey="fat" name="Gordura (g)" stroke="#e11d48" dot={false} />
      </LineChart>
    </ChartFrame>
  );
}

export function ActivityChart({ data }: { data: HistoryPoint[] }) {
  return (
    <ChartFrame title="Passos e calorias de atividade">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" tick={AXIS_STYLE} tickFormatter={shortDate} />
        <YAxis yAxisId="left" tick={AXIS_STYLE} />
        <YAxis yAxisId="right" orientation="right" tick={AXIS_STYLE} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line yAxisId="left" type="monotone" dataKey="steps" name="Passos" stroke="#18181b" dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="activityCalories" name="Kcal atividade" stroke="#059669" dot={false} />
      </LineChart>
    </ChartFrame>
  );
}

export function BalanceChart({ data }: { data: HistoryPoint[] }) {
  return (
    <ChartFrame title="Deficit / superavit estimado">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis dataKey="date" tick={AXIS_STYLE} tickFormatter={shortDate} />
        <YAxis tick={AXIS_STYLE} />
        <Tooltip />
        <Line type="monotone" dataKey="balance" name="Balanco (kcal)" stroke="#7c3aed" dot={false} />
      </LineChart>
    </ChartFrame>
  );
}

function ChartFrame({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-zinc-900">{title}</h2>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function shortDate(value: string): string {
  return value.slice(5); // MM-DD
}
