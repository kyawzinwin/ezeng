/**
 * Pronunciation helpers.
 *
 * - `fetchPronunciation` looks up IPA text + recorded audio from the free
 *   Dictionary API (dictionaryapi.dev — no key required). Works for single
 *   English words; phrases/idioms often have no entry (returns nulls).
 * - `playPronunciation` plays a recorded clip when available, otherwise falls
 *   back to the browser's built-in speech synthesis (works for any text).
 */

export interface PronunciationResult {
  ipa: string | null;
  audioUrl: string | null;
}

interface DictPhonetic {
  text?: string;
  audio?: string;
}
interface DictEntry {
  phonetic?: string;
  phonetics?: DictPhonetic[];
}

export async function fetchPronunciation(
  word: string,
): Promise<PronunciationResult> {
  const term = word.trim();
  if (!term) return { ipa: null, audioUrl: null };

  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`,
  );
  if (!res.ok) return { ipa: null, audioUrl: null }; // 404 = no entry

  const entries = (await res.json()) as DictEntry[];
  const phonetics = entries.flatMap((e) => e.phonetics ?? []);

  const ipa =
    entries.find((e) => e.phonetic)?.phonetic ??
    phonetics.find((p) => p.text)?.text ??
    null;
  const audioUrl = phonetics.find((p) => p.audio)?.audio || null;

  return { ipa, audioUrl };
}

/** Speak arbitrary text with the browser's built-in voices. */
export function speak(text: string, lang = "en-US") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

/** Play a recorded clip if we have one; otherwise synthesize speech. */
export function playPronunciation(text: string, audioUrl?: string | null) {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(() => speak(text)); // fall back if the clip fails
    return;
  }
  speak(text);
}
