import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";
import { SAMPLE_CARDS } from "./sample-data";
import { fetchAllCards } from "./cards-query";
import type { Card } from "./types";

/**
 * Loads all cards for the public practice deck. Falls back to bundled sample
 * data when Supabase is not configured, so the app always renders something.
 */
export async function getCards(): Promise<Card[]> {
  if (!isSupabaseConfigured) return SAMPLE_CARDS;

  try {
    const supabase = await createClient();
    return await fetchAllCards(supabase);
  } catch (error) {
    console.error("Failed to load cards from Supabase:", error);
    return SAMPLE_CARDS;
  }
}
