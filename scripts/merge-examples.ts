/**
 * Merge {lemma: [example_en, example_my]} JSON into card-data.csv's
 * ExampleEn/ExampleMy columns, matched by Lemma. CSV-quotes fields that
 * contain a comma/quote/newline (examples do; earlier columns never did).
 *
 * Run: node scripts/merge-examples.ts <batch.json>
 */
import { readFileSync, writeFileSync } from "fs";

const csvPath = "card-data.csv";
const batchPath = process.argv[2];
if (!batchPath) throw new Error("Usage: merge-examples.ts <batch.json>");

const batch: Record<string, [string, string]> = JSON.parse(
  readFileSync(batchPath, "utf-8"),
);

function parseLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      fields.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

function stringifyField(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const raw = readFileSync(csvPath, "utf-8");
const lines = raw.split("\n").filter((l, i, arr) => !(i === arr.length - 1 && l === ""));
const header = parseLine(lines[0].replace(/\r$/, ""));

let enIdx = header.indexOf("ExampleEn");
let myIdx = header.indexOf("ExampleMy");
if (enIdx === -1) {
  header.push("ExampleEn");
  enIdx = header.length - 1;
}
if (myIdx === -1) {
  header.push("ExampleMy");
  myIdx = header.length - 1;
}
const lemmaIdx = 0;

let updated = 0;
let notFound: string[] = [];
const rows = lines.slice(1).map((l) => parseLine(l.replace(/\r$/, "")));
for (const fields of rows) {
  while (fields.length < header.length) fields.push("");
  const lemma = fields[lemmaIdx];
  const pair = batch[lemma];
  if (!pair) continue;
  fields[enIdx] = pair[0];
  fields[myIdx] = pair[1];
  updated++;
}

const usedLemmas = new Set(rows.map((f) => f[lemmaIdx]));
for (const lemma of Object.keys(batch)) {
  if (!usedLemmas.has(lemma)) notFound.push(lemma);
}

const out = [header, ...rows]
  .map((fields) => fields.map(stringifyField).join(","))
  .join("\n");
writeFileSync(csvPath, out + "\n", "utf-8");

console.log(`Updated ${updated} rows from ${batchPath}.`);
if (notFound.length) console.log(`Not found in CSV: ${notFound.join(", ")}`);
