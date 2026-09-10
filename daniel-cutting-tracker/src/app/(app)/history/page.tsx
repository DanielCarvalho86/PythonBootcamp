import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { getHistory } from "@/lib/services/getHistory";
import { ActivityChart, BalanceChart, CaloriesChart, MacrosChart, WeightChart } from "@/components/charts/HistoryCharts";

const RANGE_OPTIONS = [7, 14, 30, 60, 90];

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const userId = await requireUserId();
  const params = await searchParams;
  const range = RANGE_OPTIONS.includes(Number(params.range)) ? Number(params.range) : 30;

  const data = await getHistory(userId, range);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">Historico</h1>
        <div className="mt-2 flex gap-2">
          {RANGE_OPTIONS.map((r) => (
            <Link
              key={r}
              href={`/history?range=${r}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                r === range ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {r}d
            </Link>
          ))}
        </div>
      </div>

      <WeightChart data={data} />
      <CaloriesChart data={data} />
      <MacrosChart data={data} />
      <ActivityChart data={data} />
      <BalanceChart data={data} />
    </div>
  );
}
