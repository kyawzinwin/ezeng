/**
 * Backfill Pronunciation + AudioUrl columns in card-data.csv from dictionaryapi.dev.
 * Writes back to the CSV only — does not touch Supabase.
 *
 * Run: npx tsx scripts/backfill-csv-pronunciation.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { fetchPronunciation } from "../lib/pronunciation.ts";

const path = "card-data.csv";
const lines = readFileSync(path, "utf-8").split("\n");
const header = lines[0].replace(/\r$/, "");
const cols = header.split(",");

let pronIdx = cols.indexOf("Pronunciation");
let audioIdx = cols.indexOf("AudioUrl");
if (pronIdx === -1) {
  cols.push("Pronunciation");
  pronIdx = cols.length - 1;
}
if (audioIdx === -1) {
  cols.push("AudioUrl");
  audioIdx = cols.length - 1;
}

const rows = lines.slice(1).filter((l) => l.trim() !== "");
let updated = 0;

for (let i = 0; i < rows.length; i++) {
  const raw = rows[i].replace(/\r$/, "");
  const fields = raw.split(",");
  while (fields.length < cols.length) fields.push("");

  const lemma = fields[0];
  if (fields[pronIdx] && fields[audioIdx]) continue; // already complete

  let { ipa, audioUrl } = await fetchPronunciation(lemma);
  if (!audioUrl) {
    await new Promise((r) => setTimeout(r, 1500));
    ({ ipa, audioUrl } = await fetchPronunciation(lemma));
  }
  fields[pronIdx] = ipa ?? fields[pronIdx];
  fields[audioIdx] = audioUrl ?? fields[audioIdx];
  rows[i] = fields.join(",");
  updated++;
  console.log(
    `[${i + 1}/${rows.length}] ${lemma}  ipa=${fields[pronIdx] || "-"}  audio=${fields[audioIdx] ? "yes" : "-"}`,
  );
  await new Promise((r) => setTimeout(r, 600)); // be gentle on the free API
}

writeFileSync(path, [cols.join(","), ...rows].join("\n") + "\n", "utf-8");
console.log(`\nDone. Updated ${updated} of ${rows.length} rows.`);
