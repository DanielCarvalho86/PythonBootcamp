import Link from "next/link";
import { Card } from "@/components/dashboard/Card";

const SEVERITY_ORDER: Record<string, number> = { WARNING: 0, NOTICE: 1, INFO: 2 };
const SEVERITY_STYLES: Record<string, string> = {
  INFO: "bg-zinc-100 text-zinc-600",
  NOTICE: "bg-amber-50 text-amber-700",
  WARNING: "bg-rose-50 text-rose-700",
};

export interface AlertSummaryItem {
  id: string;
  severity: string;
  title: string;
  message: string;
}

export function AlertsSummaryCard({ alerts }: { alerts: AlertSummaryItem[] }) {
  if (alerts.length === 0) return null;

  const sorted = [...alerts].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));
  const top = sorted.slice(0, 3);

  return (
    <Card title="Alertas">
      <div className="flex flex-col gap-2">
        {top.map((alert) => (
          <div key={alert.id} className="flex items-start gap-2">
            <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.INFO}`}>
              {alert.severity}
            </span>
            <div>
              <p className="text-xs font-medium text-zinc-900">{alert.title}</p>
              <p className="text-[11px] text-zinc-500">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
      <Link href="/alerts" className="mt-3 inline-block text-xs font-medium text-zinc-500 hover:text-zinc-900">
        Ver todos ({alerts.length}) →
      </Link>
    </Card>
  );
}
