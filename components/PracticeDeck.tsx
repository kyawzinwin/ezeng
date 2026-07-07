"use client";

import { useEffect, useMemo, useState } from "react";
import CategorySelect from "./CategorySelect";
import Flashcard from "./Flashcard";
import { CARD_TYPES, type Card, type CardType, type Direction } from "@/lib/types";

const TYPE_LABELS: Record<CardType, string> = {
  word: "Words",
  phrase: "Phrases",
  idiom: "Idioms",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeDeck({ cards }: { cards: Card[] }) {
  // Type pills are independent filters, none selected by default (= show all).
  // Selecting one or more narrows the deck to just those types.
  const [selectedTypes, setSelectedTypes] = useState<Set<CardType>>(
    () => new Set(),
  );
  const [category, setCategory] = useState<string>("all");
  const [direction, setDirection] = useState<Direction>("en-my");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [order, setOrder] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");

  // Unique categories present in the deck, for the category dropdown.
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of cards) if (c.category) set.add(c.category);
    return Array.from(set).sort();
  }, [cards]);

  // Type pills to show: only the types that have cards in the selected
  // category — so empty type buttons are hidden.
  const visibleTypes = useMemo(() => {
    const present = new Set<CardType>();
    for (const c of cards) {
      if (category !== "all" && (c.category ?? "") !== category) continue;
      present.add(c.type);
    }
    return CARD_TYPES.filter((t) => present.has(t));
  }, [cards, category]);

  // Shuffle once on mount. Done in an effect (not during render) so the server
  // and client agree on the initial HTML and hydration doesn't mismatch.
  useEffect(() => {
    setOrder(shuffle(cards.map((c) => c.id)));
  }, [cards]);

  const deck = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = cards.filter((c) => {
      if (selectedTypes.size > 0 && !selectedTypes.has(c.type)) return false;
      if (category !== "all" && (c.category ?? "") !== category) return false;
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
  }, [cards, selectedTypes, category, order, query]);

  const current = deck[index];
  // The deck is shuffled in a mount effect, so `order` stays null until then.
  // Gate the card on it to avoid a flash of the un-shuffled order on load.
  const ready = order !== null;

  // Toggle a type pill. Deselecting all returns to the default (show all).
  function toggleType(t: CardType) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
    setIndex(0);
    setFlipped(false);
  }

  // Searching changes the deck, so return to the first matching card.
  function changeQuery(next: string) {
    setQuery(next);
    setIndex(0);
    setFlipped(false);
  }

  // Changing the category filter also rewinds to the first matching card.
  function changeCategory(next: string) {
    setCategory(next);
    setIndex(0);
    setFlipped(false);
    // Drop any selected types that don't exist in the new category (emptying
    // the set just falls back to showing all types in that category).
    const present = new Set<CardType>();
    for (const c of cards) {
      if (next !== "all" && (c.category ?? "") !== next) continue;
      present.add(c.type);
    }
    setSelectedTypes((prev) => {
      const pruned = new Set([...prev].filter((t) => present.has(t)));
      return pruned.size === prev.size ? prev : pruned;
    });
  }

  function go(delta: number) {
    if (deck.length === 0) return;
    setFlipped(false);
    setIndex((i) => (i + delta + deck.length) % deck.length);
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {/* Type filters + category picker */}
      <div className="flex flex-wrap justify-center gap-2">
        {visibleTypes.map((t) => {
          const on = selectedTypes.has(t);
          return (
            <button
              key={t}
              onClick={() => toggleType(t)}
              aria-pressed={on}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                on
                  ? "bg-accent text-white shadow"
                  : "bg-sand text-muted hover:bg-accent-soft/30"
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          );
        })}
        {categories.length > 0 && (
          <CategorySelect
            value={category}
            options={categories}
            onChange={changeCategory}
          />
        )}
      </div>

      {/* Language: which side shows first */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-sand bg-card p-1">
          <button
            onClick={() => setDirection("en-my")}
            aria-pressed={direction === "en-my"}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              direction === "en-my"
                ? "bg-accent-soft/30 text-ink"
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
                ? "bg-accent-soft/30 text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            မြန်မာ
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="search"
        value={query}
        onChange={(e) => changeQuery(e.target.value)}
        placeholder="Search words, phrases, idioms…"
        className="w-full rounded-full border border-sand bg-card px-4 py-2 text-sm text-ink outline-none focus:border-accent"
      />

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
          {query ? "No cards match your search." : "No cards yet."}
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
