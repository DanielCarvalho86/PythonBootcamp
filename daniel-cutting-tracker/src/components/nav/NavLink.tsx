"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-center text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
        isActive ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
      }`}
    >
      <span className={`text-base ${isActive ? "" : "opacity-60"}`} aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
      <span className={`h-0.5 w-6 rounded-full ${isActive ? "bg-zinc-900" : "bg-transparent"}`} aria-hidden="true" />
    </Link>
  );
}
