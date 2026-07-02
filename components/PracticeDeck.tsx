"use client";

import { useEffect, useMemo, useState } from "react";
import Flashcard from "./Flashcard";
import { CARD_TYPES, type Card, type CardType, type Direction } from "@/lib/types";

type Mode = CardType | "all";

const MODE_LABELS: Record<Mode, string> = {
  all: "All",
  word: "Words",
  phrase: "Phrases",
  idiom: "Idioms",
};

const MODES: Mode[] = ["all", ...CARD_TYPES];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeDeck({ cards }: { cards: Card[] }) {
  const [type, setType] = useState<Mode>("all");
  const [direction, setDirection] = useState<Direction>("en-my");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [order, setOrder] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");

  // Shuffle once on mount. Done in an effect (not during render) so the server
  // and client agree on the initial HTML and hydration doesn't mismatch.
  useEffect(() => {
    setOrder(shuffle(cards.map((c) => c.id)));
  }, [cards]);

  const deck = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = cards.filter((c) => {
      if (type !== "all" && c.type !== type) return false;
      if (!q) return true;
      return (
        c.english.toLowerCase().includes(q) ||
        c.burmese.toLowerCase().includes(q) ||
        (c.category ?? "").toLowerCase().includes(q)
      );
    });
    if (!order) return filtered;
    const byId = new Map(filtered.map((c) => [c.id, c]));
    return order.map((id) => byId.get(id)).filter(Boolean) as Card[];
  }, [cards, type, order, query]);

  const current = deck[index];
  // The deck is shuffled in a mount effect, so `order` stays null until then.
  // Gate the card on it to avoid a flash of the un-shuffled order on load.
  const ready = order !== null;

  // Keep the shuffled order when switching modes; just jump back to the start.
  function reset(nextType?: Mode) {
    if (nextType) setType(nextType);
    setIndex(0);
    setFlipped(false);
  }

  // Searching changes the deck, so return to the first matching card.
  function changeQuery(next: string) {
    setQuery(next);
    setIndex(0);
    setFlipped(false);
  }

  function go(delta: number) {
    if (deck.length === 0) return;
    setFlipped(false);
    setIndex((i) => (i + delta + deck.length) % deck.length);
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {/* Type filters */}
      <div className="flex flex-wrap justify-center gap-2">
        {MODES.map((t) => (
          <button
            key={t}
            onClick={() => reset(t)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              type === t
                ? "bg-accent text-white shadow"
                : "bg-sand text-muted hover:bg-accent-soft/30"
            }`}
          >
            {MODE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        value={query}
        onChange={(e) => changeQuery(e.target.value)}
        placeholder="Search words, phrases, idioms…"
        className="w-full rounded-full border border-sand bg-card px-4 py-2 text-sm text-ink outline-none focus:border-accent"
      />

      {/* Language: which side shows first */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-sand bg-card p-1">
          <button
            onClick={() => setDirection("en-my")}
            aria-pressed={direction === "en-my"}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              direction === "en-my"
                ? "bg-[#f6d3a9] text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setDirection("my-en")}
            aria-pressed={direction === "my-en"}
            className={`font-my rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              direction === "my-en"
                ? "bg-[#f6d3a9] text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            မြန်မာ
          </button>
        </div>
      </div>

      {/* Card */}
      {!ready ? (
        <div className="flex h-72 items-center justify-center rounded-3xl border border-sand bg-card shadow-lg shadow-black/5 sm:h-80">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-sand border-t-accent"
            role="status"
            aria-label="Shuffling cards"
          />
        </div>
      ) : current ? (
        <Flashcard
          key={current.id}
          card={current}
          direction={direction}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
        />
      ) : (
        <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-sand px-6 text-center text-muted sm:h-80">
          {query
            ? "No cards match your search."
            : type === "all"
              ? "No cards yet."
              : `No ${MODE_LABELS[type].toLowerCase()} yet.`}
        </div>
      )}

      {/* Controls */}
      {ready && deck.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => go(-1)}
            className="rounded-full bg-sand px-5 py-2 text-sm font-semibold text-ink transition hover:bg-accent-soft/30"
          >
            ← Prev
          </button>
          <span className="min-w-16 text-center text-sm text-muted">
            {index + 1} / {deck.length}
          </span>
          <button
            onClick={() => go(1)}
            className="rounded-full bg-sand px-5 py-2 text-sm font-semibold text-ink transition hover:bg-accent-soft/30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
