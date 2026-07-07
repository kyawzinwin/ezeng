"use client";

import { useEffect, useRef, useState } from "react";
import { formatCategory } from "@/lib/format";

/**
 * Pill-styled category picker with a search box — a small combobox, since a
 * native <select> can't be searched or matched to the pill UI. Renders inline
 * with the type pills.
 */
export default function CategorySelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = options.filter((o) => o.toLowerCase().includes(q));
  const active = value !== "all";
  const label = active ? formatCategory(value) : "Category";

  function pick(v: string) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition ${
          active
            ? "bg-accent text-white shadow"
            : "bg-sand text-muted hover:bg-accent-soft/30"
        }`}
      >
        {label}
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M3 4.5 6 7.5 9 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-2xl border border-sand bg-card p-2 shadow-lg">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search category…"
            className="mb-2 w-full rounded-lg border border-sand bg-cream px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
          />
          <ul role="listbox" className="max-h-56 overflow-auto">
            <Option label="All categories" active={value === "all"} onClick={() => pick("all")} />
            {filtered.map((o) => (
              <Option
                key={o}
                label={formatCategory(o)}
                active={value === o}
                onClick={() => pick(o)}
              />
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted">No match.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function Option({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
          active
            ? "bg-accent-soft/30 font-semibold text-ink"
            : "text-muted hover:bg-sand"
        }`}
      >
        {label}
      </button>
    </li>
  );
}
