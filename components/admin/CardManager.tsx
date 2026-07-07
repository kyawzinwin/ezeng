"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchPronunciation } from "@/lib/pronunciation";
import { formatCategory } from "@/lib/format";
import {
  CARD_TYPES,
  CATEGORIES,
  type Card,
  type CardInput,
  type CardType,
} from "@/lib/types";

const EMPTY: CardInput = {
  type: "word",
  english: "",
  burmese: "",
  example_en: "",
  example_my: "",
  pronunciation: "",
  audio_url: "",
  category: "",
};

const PAGE_SIZE = 10;

export default function CardManager({
  initialCards,
}: {
  initialCards: Card[];
}) {
  const supabase = createClient();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [form, setForm] = useState<CardInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CardType | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  function update<K extends keyof CardInput>(key: K, value: CardInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Pronunciation only applies to words; drop it when switching to phrase/idiom.
  function changeType(next: CardType) {
    setForm((f) => ({
      ...f,
      type: next,
      ...(next === "word" ? {} : { pronunciation: "", audio_url: "" }),
    }));
  }

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY);
    setError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEdit(card: Card) {
    setEditingId(card.id);
    setForm({
      type: card.type,
      english: card.english,
      burmese: card.burmese,
      example_en: card.example_en ?? "",
      example_my: card.example_my ?? "",
      pronunciation: card.pronunciation ?? "",
      audio_url: card.audio_url ?? "",
      category: card.category ?? "",
    });
    setError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(false);
  }

  async function refresh() {
    const { data } = await supabase
      .from("cards")
      .select("*")
      .order("created_at", { ascending: false });
    setCards((data as Card[]) ?? []);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // Normalize empty optional strings to null.
    const payload = {
      ...form,
      example_en: form.example_en || null,
      example_my: form.example_my || null,
      pronunciation: form.pronunciation || null,
      audio_url: form.audio_url || null,
      category: form.category || null,
    };

    const { error } = editingId
      ? await supabase.from("cards").update(payload).eq("id", editingId)
      : await supabase.from("cards").insert(payload);

    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (editingId) {
      // Editing: close the form and return to the list.
      cancelEdit();
    } else {
      // Adding: keep the form open and cleared for quick consecutive entry.
      setForm(EMPTY);
    }
    await refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this card?")) return;
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    await refresh();
  }

  async function onFetchPronunciation() {
    if (form.type !== "word" || !form.english.trim()) return;
    setFetching(true);
    setError(null);
    try {
      const { ipa, audioUrl } = await fetchPronunciation(form.english);
      if (!ipa && !audioUrl) {
        setError("No pronunciation found for this term (try a single word).");
        return;
      }
      setForm((f) => ({
        ...f,
        pronunciation: ipa ?? f.pronunciation,
        audio_url: audioUrl ?? f.audio_url,
      }));
    } catch {
      setError("Could not reach the dictionary service.");
    } finally {
      setFetching(false);
    }
  }

  // Filter by type + free-text search across english, burmese, and category.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      if (filter !== "all" && c.type !== filter) return false;
      if (!q) return true;
      return (
        c.english.toLowerCase().includes(q) ||
        c.burmese.toLowerCase().includes(q) ||
        (c.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [cards, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp during render so a shrinking result set (e.g. after delete) can't
  // leave us stranded on an out-of-range page.
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function changeFilter(next: CardType | "all") {
    setFilter(next);
    setPage(1);
  }

  function changeQuery(next: string) {
    setQuery(next);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header: title on the left, add button on the right — one line */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-ink">All cards</h2>
          <p className="text-xs text-muted">{cards.length} total</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={startAdd}
            className="shrink-0 rounded-lg bg-accent px-5 py-2 font-semibold text-white transition hover:opacity-90"
          >
            ＋ Add new card
          </button>
        )}
      </div>

      {/* Add / edit form — toggled by the button above */}
      {showForm && (
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-sand bg-card p-6"
        >
          <h2 className="font-bold text-ink">
            {editingId ? "Edit card" : "Add a new card"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-muted">
              Type
              <select
                value={form.type}
                onChange={(e) => changeType(e.target.value as CardType)}
                className="rounded-lg border border-sand bg-cream px-3 py-2 text-ink outline-none focus:border-accent"
              >
                {CARD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-muted">
              Category (optional)
              <select
                value={form.category ?? ""}
                onChange={(e) => update("category", e.target.value)}
                className="rounded-lg border border-sand bg-cream px-3 py-2 text-ink outline-none focus:border-accent"
              >
                <option value="">— none —</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {formatCategory(c)}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="English"
              required
              value={form.english}
              onChange={(v) => update("english", v)}
            />
            <Field
              label="Burmese"
              required
              burmese
              value={form.burmese}
              onChange={(v) => update("burmese", v)}
            />
            {form.type === "word" && (
              <>
                <Field
                  label="Pronunciation / IPA (optional)"
                  value={form.pronunciation ?? ""}
                  onChange={(v) => update("pronunciation", v)}
                />
                <Field
                  label="Audio URL (optional)"
                  value={form.audio_url ?? ""}
                  onChange={(v) => update("audio_url", v)}
                />
              </>
            )}
            <Field
              label="Example — English (optional)"
              value={form.example_en ?? ""}
              onChange={(v) => update("example_en", v)}
            />
            <Field
              label="Example — Burmese (optional)"
              burmese
              value={form.example_my ?? ""}
              onChange={(v) => update("example_my", v)}
            />
          </div>

          {form.type === "word" && (
            <button
              type="button"
              onClick={onFetchPronunciation}
              disabled={fetching || !form.english.trim()}
              className="self-start text-sm font-semibold text-accent hover:underline disabled:opacity-40 disabled:no-underline"
            >
              {fetching ? "Fetching…" : "↯ Fetch pronunciation from dictionary"}
            </button>
          )}

          {error && <p className="text-sm text-accent">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-accent px-5 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Saving…" : editingId ? "Update card" : "Add card"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg bg-sand px-5 py-2 font-semibold text-ink"
            >
              {editingId ? "Cancel" : "Close"}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder="Search.."
            className="w-full rounded-lg border border-sand bg-card px-4 py-2 text-ink outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", ...CARD_TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => changeFilter(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                filter === t
                  ? "bg-accent text-white"
                  : "bg-sand text-muted hover:bg-accent-soft/30"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto text-sm text-muted">
            {filtered.length} card{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {paged.map((card) => (
            <li
              key={card.id}
              className="flex items-center gap-4 rounded-xl border border-sand bg-card px-4 py-3"
            >
              <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-muted">
                {card.type}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">
                  {card.english}
                </p>
                <p className="font-my truncate text-sm leading-8 text-muted">
                  {card.burmese}
                </p>
              </div>
              <button
                onClick={() => startEdit(card)}
                className="text-sm font-semibold text-accent hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(card.id)}
                className="text-sm font-semibold text-muted hover:text-accent"
              >
                Delete
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-xl border border-dashed border-sand px-4 py-8 text-center text-muted">
              {query || filter !== "all"
                ? "No cards match your search."
                : "No cards yet."}
            </li>
          )}
        </ul>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
              className="rounded-full bg-sand px-4 py-1.5 text-sm font-semibold text-ink transition hover:bg-accent-soft/30 disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="min-w-20 text-center text-sm text-muted">
              Page {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages}
              className="rounded-full bg-sand px-4 py-1.5 text-sm font-semibold text-ink transition hover:bg-accent-soft/30 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  burmese,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  burmese?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted">
      {label}
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded-lg border border-sand bg-cream px-3 py-2 text-ink outline-none focus:border-accent ${burmese ? "font-my" : ""}`}
      />
    </label>
  );
}
