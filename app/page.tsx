import AnnouncementsWidget from "@/components/AnnouncementsWidget";
import PracticeDeck from "@/components/PracticeDeck";
import { getCards } from "@/lib/cards";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Structured data helps Google understand this is a free educational app for
// English learners, and can enable richer search results.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  inLanguage: ["en", "my"],
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "Burmese speakers learning English",
  },
};

export default async function Home() {
  const cards = await getCards();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink">
          Ez<span className="text-accent">Eng</span>
        </h1>
        <p
          lang="my"
          className="font-my mx-auto mt-3 max-w-md text-lg leading-relaxed text-muted"
        >
          လွယ်ကူလေ့လာ အင်္ဂလိပ်စာ
        </p>
      </header>

      <AnnouncementsWidget />

      <PracticeDeck cards={cards} />
    </main>
  );
}
