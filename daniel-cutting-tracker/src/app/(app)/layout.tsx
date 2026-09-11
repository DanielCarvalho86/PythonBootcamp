import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { logoutAction } from "@/app/(app)/actions";

const NAV_ITEMS = [
  { href: "/", label: "Hoje" },
  { href: "/history", label: "Historico" },
  { href: "/progress", label: "Evolucao" },
  { href: "/alerts", label: "Alertas" },
  { href: "/plan", label: "Plano" },
  { href: "/settings", label: "Config" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-zinc-900">Daniel Cutting Tracker</span>
          <form action={logoutAction}>
            <button type="submit" className="text-xs text-zinc-400 hover:text-zinc-600">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl justify-around">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 px-2 py-3 text-center text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
