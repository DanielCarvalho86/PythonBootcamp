export function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm ${className}`}>
      {title && <h2 className="mb-3 text-sm font-semibold text-zinc-900">{title}</h2>}
      {children}
    </section>
  );
}

export function ProgressBar({ value, max, colorClassName = "bg-zinc-900" }: { value: number; max: number; colorClassName?: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
      <div className={`h-full rounded-full ${colorClassName}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-zinc-900">
        {value} {sub && <span className="text-xs font-normal text-zinc-400">{sub}</span>}
      </span>
    </div>
  );
}
