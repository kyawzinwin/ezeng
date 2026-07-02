export type CardType = "word" | "phrase" | "idiom";

export const CARD_TYPES: CardType[] = ["word", "phrase", "idiom"];

/** Learning direction shown on the front of the card. */
export type Direction = "en-my" | "my-en";

export interface Card {
  id: string;
  type: CardType;
  english: string;
  burmese: string;
  example_en: string | null;
  example_my: string | null;
  pronunciation: string | null;
  audio_url: string | null;
  category: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Shape used when creating/editing in the admin area. */
export type CardInput = Omit<Card, "id" | "created_at" | "updated_at">;
