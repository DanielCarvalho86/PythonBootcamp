"use client";

import { useTransition } from "react";
import { markAlertReadAction } from "@/app/(app)/alerts/actions";

const SEVERITY_STYLES: Record<string, string> = {
  INFO: "bg-zinc-100 text-zinc-600",
  NOTICE: "bg-amber-50 text-amber-700",
  WARNING: "bg-rose-50 text-rose-700",
};

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
    <div className={`rounded-xl border p-3 ${alert.isRead ? "border-zinc-100 opacity-60" : "border-zinc-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.INFO}`}>
              {alert.severity}
            </span>
            <p className="text-sm font-semibold text-zinc-900">{alert.title}</p>
          </div>
          <p className="mt-1 text-xs text-zinc-600">{alert.message}</p>
          <p className="mt-1 text-[10px] text-zinc-400">Ultima deteccao: {alert.date}</p>
        </div>
        <button
          onClick={() => startTransition(() => markAlertReadAction(alert.id, !alert.isRead))}
          disabled={isPending}
          className="shrink-0 text-xs font-medium text-zinc-500 hover:text-zinc-900"
        >
          {alert.isRead ? "Marcar nao lido" : "Marcar lido"}
        </button>
      </div>
    </div>
  );
}
