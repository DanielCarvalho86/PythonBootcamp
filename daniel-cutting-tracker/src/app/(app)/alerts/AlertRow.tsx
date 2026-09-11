"use client";

import { useTransition } from "react";
import { markAlertReadAction } from "@/app/(app)/alerts/actions";
import { Badge, type Tone } from "@/components/dashboard/Card";

const SEVERITY_TONE: Record<string, Tone> = { INFO: "neutral", NOTICE: "warning", WARNING: "alert" };

export interface AlertRowData {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

export function AlertRow({ alert }: { alert: AlertRowData }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`rounded-xl border p-3 ${alert.isRead ? "border-zinc-100 opacity-60" : "border-zinc-200 bg-white shadow-sm"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={SEVERITY_TONE[alert.severity] ?? "neutral"}>{alert.severity}</Badge>
            <p className="text-sm font-semibold text-zinc-900">{alert.title}</p>
          </div>
          <p className="mt-1 text-xs text-zinc-600">{alert.message}</p>
          <p className="mt-1 text-[10px] text-zinc-400">Ultima deteccao: {alert.date}</p>
        </div>
        <button
          onClick={() => startTransition(() => markAlertReadAction(alert.id, !alert.isRead))}
          disabled={isPending}
          className="min-h-[36px] shrink-0 rounded-lg px-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50"
        >
          {alert.isRead ? "Marcar nao lido" : "Marcar lido"}
        </button>
      </div>
    </div>
  );
}
