import type { SupabaseClient } from "@supabase/supabase-js";
import type { Card } from "./types";

const PAGE_SIZE = 1000; // PostgREST's default max-rows cap — page past it, don't rely on it changing

/**
 * Fetches every row in `cards`, paging past PostgREST's default 1000-row cap.
 * First page also asks for the total count, so remaining pages can be fetched
 * in parallel instead of one round trip at a time.
 */
export async function fetchAllCards(supabase: SupabaseClient): Promise<Card[]> {
  const first = await supabase
    .from("cards")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  if (first.error) throw first.error;
  const rows = ((first.data as Card[]) ?? []).slice();
  const total = first.count ?? rows.length;

  const remainingPages = Math.ceil((total - rows.length) / PAGE_SIZE);
  if (remainingPages > 0) {
    const pages = await Promise.all(
      Array.from({ length: remainingPages }, (_, i) => {
        const from = PAGE_SIZE * (i + 1);
        return supabase
          .from("cards")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + PAGE_SIZE - 1);
      }),
    );
    for (const { data, error } of pages) {
      if (error) throw error;
      rows.push(...((data as Card[]) ?? []));
    }
  }

  return rows;
}
