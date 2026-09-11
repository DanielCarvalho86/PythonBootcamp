export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      {title && <h2 className="mb-3 text-sm font-semibold text-zinc-900">{title}</h2>}
      {children}
    </section>
  );
}

export function ProgressBar({ value, max, colorClassName = "bg-zinc-900" }: { value: number; max: number; colorClassName?: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
      <div className={`h-full rounded-full transition-[width] ${colorClassName}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-right text-sm font-medium text-zinc-900">
        {value} {sub && <span className="text-xs font-normal text-zinc-400">{sub}</span>}
      </span>
    </div>
  );
}

/**
 * Semantic status: color always pairs with text/icon, never color-only
 * (accessibility requirement — never rely on hue alone to convey state).
 */
export type Tone = "good" | "warning" | "alert" | "info" | "neutral";

const TONE_STYLES: Record<Tone, { badge: string; bar: string; dot: string }> = {
  good: { badge: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-600", dot: "bg-emerald-600" },
  warning: { badge: "bg-amber-50 text-amber-700", bar: "bg-amber-500", dot: "bg-amber-500" },
  alert: { badge: "bg-rose-50 text-rose-700", bar: "bg-rose-600", dot: "bg-rose-600" },
  info: { badge: "bg-blue-50 text-blue-700", bar: "bg-blue-600", dot: "bg-blue-600" },
  neutral: { badge: "bg-zinc-100 text-zinc-600", bar: "bg-zinc-400", dot: "bg-zinc-400" },
};

export function toneStyles(tone: Tone) {
  return TONE_STYLES[tone];
}

export function Badge({ tone, children, icon }: { tone: Tone; children: React.ReactNode; icon?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE_STYLES[tone].badge}`}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

/**
 * Progress bar for a range-based target (min-max), with a distinct
 * below/within/above state rather than a single fabricated percentage.
 */
export function RangeBar({ value, min, max }: { value: number; min?: number; max?: number }) {
  const tone: Tone = min !== undefined && value < min ? "warning" : max !== undefined && value > max ? "warning" : "good";
  const scaleMax = (max ?? min ?? value ?? 1) * 1.15 || 1;
  const pct = Math.min(100, Math.max(0, (value / scaleMax) * 100));
  const minPct = min !== undefined ? Math.min(100, (min / scaleMax) * 100) : null;
  const maxPct = max !== undefined ? Math.min(100, (max / scaleMax) * 100) : null;

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-100">
      <div className={`h-full rounded-full transition-[width] ${TONE_STYLES[tone].bar}`} style={{ width: `${pct}%` }} />
      {minPct !== null && <div className="absolute top-0 h-full w-px bg-zinc-400" style={{ left: `${minPct}%` }} />}
      {maxPct !== null && <div className="absolute top-0 h-full w-px bg-zinc-400" style={{ left: `${maxPct}%` }} />}
    </div>
  );
}

export function rangeStatusLabel(value: number, min?: number, max?: number): { text: string; tone: Tone } {
  if (min !== undefined && value < min) return { text: "Abaixo da meta", tone: "warning" };
  if (max !== undefined && value > max) return { text: "Acima da meta", tone: "warning" };
  if (min !== undefined || max !== undefined) return { text: "Dentro da meta", tone: "good" };
  return { text: "Sem meta definida", tone: "neutral" };
}
