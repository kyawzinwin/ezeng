import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCategory } from "@/lib/format";
import { IconCards, IconMegaphone, Panel, Stat } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Lightweight reads — only the columns the stats need.
  const [{ data: cards }, { data: posts }, { data: setting }] =
    await Promise.all([
      supabase.from("cards").select("type,category"),
      supabase.from("announcements").select("published"),
      supabase
        .from("app_settings")
        .select("value")
        .eq("key", "announcements_widget_enabled")
        .maybeSingle(),
    ]);

  const rows = cards ?? [];
  const byType = { word: 0, phrase: 0, idiom: 0 } as Record<string, number>;
  const byCat = new Map<string, number>();
  for (const c of rows) {
    byType[c.type] = (byType[c.type] ?? 0) + 1;
    const key = c.category ?? "uncategorized";
    byCat.set(key, (byCat.get(key) ?? 0) + 1);
  }
  const cats = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
  const max = cats[0]?.[1] ?? 1;

  const announcements = posts ?? [];
  const published = announcements.filter((a) => a.published).length;
  const widgetOn = setting?.value !== false;

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total cards" value={rows.length} icon={<IconCards />} />
        <Stat label="Words" value={byType.word} icon={<IconCards />} />
        <Stat label="Phrases" value={byType.phrase} icon={<IconCards />} />
        <Stat label="Idioms" value={byType.idiom} icon={<IconCards />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category breakdown */}
        <div className="lg:col-span-2">
          <Panel title="Cards by category">
            <ul className="flex flex-col gap-3">
              {cats.map(([cat, n]) => (
                <li key={cat} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-sm text-ink">
                    {cat === "uncategorized" ? "Uncategorized" : formatCategory(cat)}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
                    <span
                      className="block h-full rounded-full bg-accent"
                      style={{ width: `${(n / max) * 100}%` }}
                    />
                  </span>
                  <span className="w-8 shrink-0 text-right text-sm font-semibold text-muted">
                    {n}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Announcements + widget status */}
        <div className="flex flex-col gap-6">
          <Stat
            label="Published posts"
            value={published}
            sub={`${announcements.length} total`}
            icon={<IconMegaphone />}
          />
          <div className="rounded-2xl border border-sand bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Homepage widget
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  widgetOn ? "bg-emerald-500" : "bg-muted"
                }`}
              />
              <span className="text-lg font-bold text-ink">
                {widgetOn ? "On" : "Off"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/cards"
          className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Manage cards
        </Link>
        <Link
          href="/admin/announcements"
          className="rounded-lg border border-sand bg-card px-5 py-2 text-sm font-semibold text-ink transition hover:border-accent"
        >
          Manage announcements
        </Link>
      </div>
    </div>
  );
}
