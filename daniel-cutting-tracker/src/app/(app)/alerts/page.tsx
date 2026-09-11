import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { syncAlertsForToday } from "@/lib/services/syncAlerts";
import { AlertRow } from "@/app/(app)/alerts/AlertRow";
import { ALERT_SEVERITIES, ALERT_TYPES } from "@/lib/analysis/alerts";

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ severity?: string; type?: string }>;
}) {
  const userId = await requireUserId();
  await syncAlertsForToday(userId);

  const { severity, type } = await searchParams;

  const alerts = await prisma.alert.findMany({
    where: {
      userId,
      ...(severity ? { severity } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: [{ isRead: "asc" }, { date: "desc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">Alertas</h1>
        <p className="text-xs text-zinc-500">
          Observacoes baseadas nos seus dados recentes. Nao sao diagnosticos e nao substituem avaliacao profissional.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2">
        <label htmlFor="alert-severity" className="sr-only">
          Filtrar por severidade
        </label>
        <select
          id="alert-severity"
          name="severity"
          defaultValue={severity ?? ""}
          className="min-h-[40px] rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-700"
        >
          <option value="">Todas as severidades</option>
          {ALERT_SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label htmlFor="alert-type" className="sr-only">
          Filtrar por tipo
        </label>
        <select
          id="alert-type"
          name="type"
          defaultValue={type ?? ""}
          className="min-h-[40px] rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-700"
        >
          <option value="">Todos os tipos</option>
          {ALERT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="submit" className="min-h-[40px] rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200">
          Filtrar
        </button>
        {(severity || type) && (
          <Link href="/alerts" className="self-center text-xs text-zinc-400 hover:text-zinc-700">
            Limpar filtros
          </Link>
        )}
      </form>

      {alerts.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-white p-4 text-sm text-zinc-400">
          <span aria-hidden="true">✓</span>
          Nenhum alerta no momento — seus dados recentes estao dentro do esperado.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={{
                id: alert.id,
                type: alert.type,
                severity: alert.severity,
                title: alert.title,
                message: alert.message,
                date: alert.date.toISOString().slice(0, 10),
                isRead: alert.isRead,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
