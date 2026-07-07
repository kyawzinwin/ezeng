"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Toaster, useToasts } from "@/components/Toast";
import type { Announcement, AnnouncementInput } from "@/lib/types";

const WIDGET_KEY = "announcements_widget_enabled";

function emptyForm(): AnnouncementInput {
  return {
    title: "",
    body: "",
    category: "",
    published: true,
    published_on: new Date().toISOString().slice(0, 10),
  };
}

export default function AnnouncementManager({
  initialAnnouncements,
  initialWidgetEnabled,
}: {
  initialAnnouncements: Announcement[];
  initialWidgetEnabled: boolean;
}) {
  const supabase = createClient();
  const [items, setItems] = useState<Announcement[]>(initialAnnouncements);
  const [form, setForm] = useState<AnnouncementInput>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [widgetOn, setWidgetOn] = useState(initialWidgetEnabled);
  const { toasts, notify } = useToasts();

  function update<K extends keyof AnnouncementInput>(
    key: K,
    value: AnnouncementInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function startEdit(a: Announcement) {
    setEditingId(a.id);
    setForm({
      title: a.title,
      body: a.body ?? "",
      category: a.category ?? "",
      published: a.published,
      published_on: a.published_on,
    });
    setShowForm(true);
  }

  function cancel() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(false);
  }

  async function refresh() {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("published_on", { ascending: false });
    setItems((data as Announcement[]) ?? []);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    const payload = {
      ...form,
      body: form.body || null,
      category: form.category || null,
    };

    const editing = editingId;
    const { error } = editing
      ? await supabase.from("announcements").update(payload).eq("id", editing)
      : await supabase.from("announcements").insert(payload);

    setBusy(false);
    if (error) {
      notify(error.message, "error");
      return;
    }
    notify(editing ? "Announcement updated" : "Announcement added");
    cancel();
    await refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      notify(error.message, "error");
      return;
    }
    notify("Announcement deleted");
    await refresh();
  }

  async function toggleWidget(next: boolean) {
    setWidgetOn(next); // optimistic
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: WIDGET_KEY, value: next }, { onConflict: "key" });
    if (error) {
      setWidgetOn(!next); // revert on failure
      notify(error.message, "error");
      return;
    }
    notify(next ? "Widget shown" : "Widget hidden");
  }

  return (
    <div className="flex flex-col gap-6">
      <Toaster toasts={toasts} />

      {/* Master widget on/off switch */}
      <label className="flex items-center justify-between rounded-2xl border border-sand bg-card px-5 py-4">
        <span className="text-sm text-ink">
          Show &ldquo;Latest updates&rdquo; widget on the homepage
        </span>
        <input
          type="checkbox"
          checked={widgetOn}
          onChange={(e) => toggleWidget(e.target.checked)}
          className="h-5 w-5 accent-[var(--color-accent)]"
        />
      </label>

      {!showForm && (
        <button
          type="button"
          onClick={startAdd}
          className="self-start rounded-lg bg-accent px-5 py-2 font-semibold text-white transition hover:opacity-90"
        >
          ＋ Add announcement
        </button>
      )}

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-sand bg-card p-6"
        >
          <h2 className="font-bold text-ink">
            {editingId ? "Edit announcement" : "Add announcement"}
          </h2>

          <label className="flex flex-col gap-1 text-sm text-muted">
            Title
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="rounded-lg border border-sand bg-cream px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted">
            Details (optional)
            <textarea
              value={form.body ?? ""}
              onChange={(e) => update("body", e.target.value)}
              rows={2}
              className="rounded-lg border border-sand bg-cream px-3 py-2 text-ink outline-none focus:border-accent"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-muted">
              Category (optional)
              <input
                type="text"
                value={form.category ?? ""}
                onChange={(e) => update("category", e.target.value)}
                placeholder="new-cards, feature, fix…"
                className="rounded-lg border border-sand bg-cream px-3 py-2 text-ink outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted">
              Date
              <input
                type="date"
                required
                value={form.published_on}
                onChange={(e) => update("published_on", e.target.value)}
                className="rounded-lg border border-sand bg-cream px-3 py-2 text-ink outline-none focus:border-accent"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => update("published", e.target.checked)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Published (visible to visitors)
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-accent px-5 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Saving…" : editingId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-lg bg-sand px-5 py-2 font-semibold text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-4 rounded-xl border border-sand bg-card px-4 py-3"
          >
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                a.published
                  ? "bg-accent-soft/30 text-accent"
                  : "bg-sand text-muted"
              }`}
            >
              {a.published ? "live" : "draft"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{a.title}</p>
              <p className="text-sm text-muted">{a.published_on}</p>
            </div>
            <button
              onClick={() => startEdit(a)}
              className="text-sm font-semibold text-accent hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(a.id)}
              className="text-sm font-semibold text-muted hover:text-accent"
            >
              Delete
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-xl border border-dashed border-sand px-4 py-8 text-center text-muted">
            No announcements yet.
          </li>
        )}
      </ul>
    </div>
  );
}
