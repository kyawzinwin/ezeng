/**
 * Backfill pronunciation + audio_url for `word` cards from dictionaryapi.dev.
 * Phrases/idioms are skipped (no reliable single-entry lookup).
 *
 * Run:  node --env-file=.env.local scripts/backfill-pronunciation.ts
 * Needs SUPABASE_SERVICE_ROLE_KEY (anon can't UPDATE under RLS).
 */
import { createClient } from "@supabase/supabase-js";
import { fetchPronunciation } from "../lib/pronunciation.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing SUPABASE_URL / SERVICE_ROLE_KEY");

const db = createClient(url, key);

const { data: cards, error } = await db
  .from("cards")
  .select("id, english, pronunciation, audio_url")
  .eq("type", "word");
if (error) throw error;

let updated = 0;
for (const c of cards ?? []) {
  if (c.pronunciation && c.audio_url) continue; // already complete
  // Retry once on a miss: rapid bulk requests get rate-limited and return nulls.
  let { ipa, audioUrl } = await fetchPronunciation(c.english);
  if (!audioUrl) {
    await new Promise((r) => setTimeout(r, 1500));
    ({ ipa, audioUrl } = await fetchPronunciation(c.english));
  }
  const patch = {
    pronunciation: ipa ?? c.pronunciation, // keep existing if API has none
    audio_url: audioUrl ?? c.audio_url,
  };
  const { error: upErr } = await db.from("cards").update(patch).eq("id", c.id);
  if (upErr) {
    console.error(`✗ ${c.english}: ${upErr.message}`);
    continue;
  }
  updated++;
  console.log(`✓ ${c.english}  ipa=${patch.pronunciation ?? "-"}  audio=${patch.audio_url ? "yes" : "-"}`);
  await new Promise((r) => setTimeout(r, 600)); // be gentle on the free API
}
console.log(`\nDone. Updated ${updated} of ${cards?.length ?? 0} word cards.`);
