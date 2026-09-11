import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { logoutAction } from "@/app/(app)/actions";
import { NavLink } from "@/components/nav/NavLink";

const NAV_ITEMS = [
  { href: "/", label: "Hoje", icon: "🏠" },
  { href: "/history", label: "Historico", icon: "📅" },
  { href: "/progress", label: "Evolucao", icon: "📈" },
  { href: "/alerts", label: "Alertas", icon: "🔔" },
  { href: "/plan", label: "Plano", icon: "🍽️" },
  { href: "/settings", label: "Config", icon: "⚙️" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-zinc-900">Daniel Cutting Tracker</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="min-h-[36px] rounded-lg px-2 text-xs text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

      <nav
        aria-label="Navegacao principal"
        className="fixed bottom-0 left-0 right-0 z-10 border-t border-zinc-200 bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-3xl justify-around">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </div>
      </nav>
    </div>
  );
}
