import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";
import { SAMPLE_CARDS } from "./sample-data";
import type { Card } from "./types";

/**
 * Loads all cards for the public practice deck. Falls back to bundled sample
 * data when Supabase is not configured, so the app always renders something.
 */
export async function getCards(): Promise<Card[]> {
  if (!isSupabaseConfigured) return SAMPLE_CARDS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load cards from Supabase:", error.message);
    return SAMPLE_CARDS;
  }

  return (data as Card[]) ?? [];
}
