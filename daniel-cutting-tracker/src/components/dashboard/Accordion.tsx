"use client";

import { useState } from "react";

export function AccordionItem({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `accordion-panel-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full flex-col gap-1.5 px-3 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-1"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-semibold text-zinc-900">{title}</span>
          <svg
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </span>
        {(badge || subtitle) && (
          <span className="flex flex-wrap items-center gap-1.5">
            {badge}
            {subtitle}
          </span>
        )}
      </button>
      {open && (
        <div id={panelId} className="border-t border-zinc-100 px-3 pb-3 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}
