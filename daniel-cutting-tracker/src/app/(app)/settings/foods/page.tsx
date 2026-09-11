import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { Card } from "@/components/dashboard/Card";
import { ToggleActiveButton } from "@/app/(app)/settings/foods/ToggleActiveButton";

type StatusFilter = "all" | "active" | "inactive";

export default async function FoodsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireUserId();
  const { q, status } = await searchParams;
  const query = (q ?? "").trim();
  const statusFilter: StatusFilter = status === "active" || status === "inactive" ? status : "all";

  const foods = await prisma.food.findMany({
    where: {
      ...(query ? { OR: [{ name: { contains: query } }, { category: { contains: query } }] } : {}),
      ...(statusFilter === "active" ? { active: true } : statusFilter === "inactive" ? { active: false } : {}),
    },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Alimentos</h1>
        <Link href="/settings/foods/new" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white">
          + Novo alimento
        </Link>
      </div>

      <form className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Buscar por nome ou categoria..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <select name="status" defaultValue={statusFilter} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <button type="submit" className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          Buscar
        </button>
      </form>

      <Card>
        <div className="flex flex-col divide-y divide-zinc-100">
          {foods.length === 0 && <p className="py-4 text-sm text-zinc-400">Nenhum alimento encontrado.</p>}
          {foods.map((food) => (
            <div key={food.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${food.active ? "text-zinc-900" : "text-zinc-400 line-through"}`}>
                  {food.name}
                  {food.verified && <span className="ml-1 text-[10px] font-normal text-emerald-600">verificado</span>}
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                      food.active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {food.active ? "Ativo" : "Inativo"}
                  </span>
                </p>
                <p className="text-xs text-zinc-500">
                  {food.category} · {Math.round(food.caloriesPer100g)} kcal/100g · P{food.proteinPer100g}g C{food.carbsPer100g}g G
                  {food.fatPer100g}g
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Link href={`/settings/foods/${food.id}`} className="text-xs text-zinc-500 hover:text-zinc-900">
                  Editar
                </Link>
                <ToggleActiveButton foodId={food.id} active={food.active} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
