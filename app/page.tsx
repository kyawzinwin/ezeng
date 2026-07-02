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
        <p className="font-my mx-auto mt-3 max-w-md text-lg leading-relaxed text-muted">
          လွယ်ကူလေ့လာ အင်္ဂလိပ်စာ
        </p>
      </header>

      <PracticeDeck cards={cards} />
    </main>
  );
}
