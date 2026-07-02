"use client";

import { motion } from "framer-motion";
import { playPronunciation } from "@/lib/pronunciation";
import type { Card, Direction } from "@/lib/types";

interface Face {
  label: string;
  term: string;
  example: string | null;
  pronunciation: string | null;
  audioUrl: string | null;
  isBurmese: boolean;
  canSpeak: boolean;
}

function faces(card: Card, direction: Direction): { front: Face; back: Face } {
  const en: Face = {
    label: "English",
    term: card.english,
    example: card.example_en,
    pronunciation: card.pronunciation,
    audioUrl: card.audio_url,
    isBurmese: false,
    // Only offer playback for words that actually have recorded audio.
    canSpeak: card.type === "word" && Boolean(card.audio_url),
  };
  const my: Face = {
    label: "မြန်မာ",
    term: card.burmese,
    example: card.example_my,
    pronunciation: null,
    audioUrl: null,
    isBurmese: true,
    canSpeak: false,
  };
  return direction === "en-my"
    ? { front: en, back: my }
    : { front: my, back: en };
}

function FaceContent({ face }: { face: Face }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted">
        {face.label}
      </span>
      <p
        className={`text-3xl font-bold text-ink sm:text-4xl ${face.isBurmese ? "font-my leading-relaxed" : ""}`}
      >
        {face.term}
      </p>
      {face.pronunciation && (
        <p className="text-base text-muted">{face.pronunciation}</p>
      )}
      {face.canSpeak && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playPronunciation(face.term, face.audioUrl);
          }}
          aria-label={`Play pronunciation of ${face.term}`}
          className="rounded-full bg-sand px-3 py-1.5 text-lg transition hover:bg-accent-soft/40"
        >
          🔊
        </button>
      )}
      {face.example && (
        <p
          className={`mt-2 max-w-sm text-sm text-muted ${face.isBurmese ? "font-my leading-relaxed" : "italic"}`}
        >
          “{face.example}”
        </p>
      )}
    </div>
  );
}

export default function Flashcard({
  card,
  direction,
  flipped,
  onFlip,
}: {
  card: Card;
  direction: Direction;
  flipped: boolean;
  onFlip: () => void;
}) {
  const { front, back } = faces(card, direction);

  return (
    <div className="perspective w-full">
      <motion.div
        role="button"
        tabIndex={0}
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onFlip();
          }
        }}
        aria-label="Flip card"
        className="preserve-3d relative block h-72 w-full cursor-pointer sm:h-80"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="backface-hidden absolute inset-0 rounded-3xl border border-sand bg-card shadow-lg shadow-black/5">
          <FaceContent face={front} />
          <span className="absolute bottom-4 right-5 text-xs text-muted">
            tap to flip
          </span>
        </div>
        <div className="backface-hidden rotate-y-180 absolute inset-0 rounded-3xl border border-accent-soft/40 bg-card shadow-lg shadow-black/5">
          <FaceContent face={back} />
        </div>
      </motion.div>
    </div>
  );
}
