import PracticeDeck from "@/components/PracticeDeck";
import { getCards } from "@/lib/cards";

export default async function Home() {
  const cards = await getCards();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink">
          Ez<span className="text-accent">Eng</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Learn English words, phrases, and idioms — with Burmese. Tap a card to
          flip it. No login needed.
        </p>
      </header>

      <PracticeDeck cards={cards} />
    </main>
  );
}
