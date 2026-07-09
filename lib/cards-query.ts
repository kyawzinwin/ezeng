import type { SupabaseClient } from "@supabase/supabase-js";
import type { Card } from "./types";

const PAGE_SIZE = 1000; // PostgREST's default max-rows cap — page past it, don't rely on it changing

/** Fetches every row in `cards`, paging past PostgREST's default 1000-row cap. */
export async function fetchAllCards(supabase: SupabaseClient): Promise<Card[]> {
  const all: Card[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    all.push(...((data as Card[]) ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return all;
}
