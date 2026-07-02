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

  // Shuffle once on mount. Done in an effect (not during render) so the server
  // and client agree on the initial HTML and hydration doesn't mismatch.
  useEffect(() => {
    setOrder(shuffle(cards.map((c) => c.id)));
  }, [cards]);

  const deck = useMemo(() => {
    const filtered =
      type === "all" ? cards : cards.filter((c) => c.type === type);
    if (!order) return filtered;
    const byId = new Map(filtered.map((c) => [c.id, c]));
    return order.map((id) => byId.get(id)).filter(Boolean) as Card[];
  }, [cards, type, order]);

  const current = deck[index];

  // Keep the shuffled order when switching modes; just jump back to the start.
  function reset(nextType?: Mode) {
    if (nextType) setType(nextType);
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
      {/* Mode picker */}
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

      {/* Direction toggle */}
      <div className="flex items-center justify-center gap-3 text-sm">
        <span className="text-muted">Show first:</span>
        <button
          onClick={() =>
            setDirection((d) => (d === "en-my" ? "my-en" : "en-my"))
          }
          className="rounded-full border border-sand bg-card px-4 py-1.5 font-semibold text-ink transition hover:border-accent"
        >
          {direction === "en-my" ? "English → မြန်မာ" : "မြန်မာ → English"}
        </button>
      </div>

      {/* Card */}
      {current ? (
        <Flashcard
          key={current.id}
          card={current}
          direction={direction}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
        />
      ) : (
        <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-sand text-muted sm:h-80">
          {type === "all" ? "No cards yet." : `No ${MODE_LABELS[type].toLowerCase()} yet.`}
        </div>
      )}

      {/* Controls */}
      {deck.length > 0 && (
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
