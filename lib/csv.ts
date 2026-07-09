import Papa from "papaparse";
import { CARD_TYPES, CATEGORIES, type Card, type CardInput } from "./types";

export const CSV_HEADERS = [
  "id",
  "type",
  "english",
  "burmese",
  "example_en",
  "example_my",
  "pronunciation",
  "audio_url",
  "category",
] as const;

/** One example row, illustrating the expected format for a blank import. */
export function csvTemplate(): string {
  return (
    Papa.BYTE_ORDER_MARK +
    Papa.unparse(
      [
        {
          id: "",
          type: "word",
          english: "example",
          burmese: "ဥပမာ",
          example_en: "This is an example sentence.",
          example_my: "ဒါက ဥပမာဝါကျတစ်ခုပါ။",
          pronunciation: "/ɪɡˈzæmpəl/",
          audio_url: "",
          category: "everyday",
        },
      ],
      { columns: [...CSV_HEADERS] },
    )
  );
}

export function cardsToCsv(cards: Card[]): string {
  // Prefix a BOM so Excel (and other apps that guess encoding) reads the
  // Burmese text as UTF-8 instead of garbling it.
  return Papa.BYTE_ORDER_MARK + Papa.unparse(
    cards.map((c) => ({
      id: c.id,
      type: c.type,
      english: c.english,
      burmese: c.burmese,
      example_en: c.example_en ?? "",
      example_my: c.example_my ?? "",
      pronunciation: c.pronunciation ?? "",
      audio_url: c.audio_url ?? "",
      category: c.category ?? "",
    })),
    { columns: [...CSV_HEADERS] },
  );
}

export type ImportRow = CardInput & { id?: string };

/** Parses + validates a cards CSV. Invalid rows are skipped and reported, not thrown. */
export function parseCardsCsv(text: string): {
  rows: ImportRow[];
  errors: string[];
} {
  const { data, errors: parseErrors } = Papa.parse<Record<string, string>>(
    text,
    { header: true, skipEmptyLines: true },
  );

  const errors = parseErrors.map(
    (e) => `Row ${(e.row ?? 0) + 2}: ${e.message}`,
  );
  const rows: ImportRow[] = [];

  data.forEach((raw, i) => {
    const lineNo = i + 2; // +1 for header, +1 for 1-indexing
    const type = raw.type?.trim();
    const english = raw.english?.trim() ?? "";
    const burmese = raw.burmese?.trim() ?? "";
    const category = raw.category?.trim() || "";

    if (!CARD_TYPES.includes(type as (typeof CARD_TYPES)[number])) {
      errors.push(`Row ${lineNo}: invalid type "${raw.type ?? ""}"`);
      return;
    }
    if (!english || !burmese) {
      errors.push(`Row ${lineNo}: english and burmese are required`);
      return;
    }
    if (
      category &&
      !CATEGORIES.includes(category as (typeof CATEGORIES)[number])
    ) {
      errors.push(`Row ${lineNo}: unknown category "${category}"`);
      return;
    }

    const isWord = type === "word";
    const row: ImportRow = {
      type: type as CardInput["type"],
      english,
      burmese,
      example_en: raw.example_en?.trim() || null,
      example_my: raw.example_my?.trim() || null,
      pronunciation: isWord ? raw.pronunciation?.trim() || null : null,
      audio_url: isWord ? raw.audio_url?.trim() || null : null,
      category: category || null,
    };
    const id = raw.id?.trim();
    if (id) row.id = id;
    rows.push(row);
  });

  return { rows, errors };
}
