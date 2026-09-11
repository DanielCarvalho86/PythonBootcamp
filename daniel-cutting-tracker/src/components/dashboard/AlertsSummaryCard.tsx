import Link from "next/link";
import { Card, Badge, type Tone } from "@/components/dashboard/Card";

const SEVERITY_ORDER: Record<string, number> = { WARNING: 0, NOTICE: 1, INFO: 2 };
const SEVERITY_TONE: Record<string, Tone> = { INFO: "neutral", NOTICE: "warning", WARNING: "alert" };

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
          <div key={alert.id} className="flex items-start gap-2 rounded-lg bg-zinc-50 px-2.5 py-2">
            <Badge tone={SEVERITY_TONE[alert.severity] ?? "neutral"}>{alert.severity}</Badge>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-900">{alert.title}</p>
              <p className="text-[11px] text-zinc-500">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/alerts"
        className="mt-3 inline-block min-h-[36px] py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
      >
        Ver todos ({alerts.length}) →
      </Link>
    </Card>
  );
}
