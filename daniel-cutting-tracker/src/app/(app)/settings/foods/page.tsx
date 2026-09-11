import Link from "next/link";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { Card, Badge } from "@/components/dashboard/Card";
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
        <Link
          href="/settings/foods/new"
          className="min-h-[40px] rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800"
        >
          + Novo alimento
        </Link>
      </div>

      <form className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="food-search" className="sr-only">
          Buscar por nome ou categoria
        </label>
        <input
          id="food-search"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Buscar por nome ou categoria..."
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <label htmlFor="food-status" className="sr-only">
          Filtrar por status
        </label>
        <select
          id="food-status"
          name="status"
          defaultValue={statusFilter}
          className="min-h-[44px] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <button type="submit" className="min-h-[44px] rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200">
          Buscar
        </button>
      </form>

      <Card>
        <div className="flex flex-col divide-y divide-zinc-100">
          {foods.length === 0 && <p className="py-4 text-sm text-zinc-400">Nenhum alimento encontrado.</p>}
          {foods.map((food) => (
            <div key={food.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0 flex-1">
                <p className={`flex flex-wrap items-center gap-1.5 truncate text-sm font-medium ${food.active ? "text-zinc-900" : "text-zinc-400 line-through"}`}>
                  {food.name}
                  {food.verified && <span className="text-[10px] font-normal text-emerald-600">verificado</span>}
                  <Badge tone={food.active ? "good" : "neutral"}>{food.active ? "Ativo" : "Inativo"}</Badge>
                </p>
                <p className="text-xs text-zinc-500">
                  {food.category} · {Math.round(food.caloriesPer100g)} kcal/100g · P{food.proteinPer100g}g C{food.carbsPer100g}g G
                  {food.fatPer100g}g
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Link href={`/settings/foods/${food.id}`} className="min-h-[36px] px-1 py-2 text-xs text-zinc-500 hover:text-zinc-900">
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
