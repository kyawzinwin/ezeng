// Central place for site-wide SEO/metadata constants so the layout, sitemap,
// robots, manifest, and social image all stay in sync.

// Set NEXT_PUBLIC_SITE_URL to your production origin (e.g. https://ezeng.app)
// so canonical URLs, sitemap, and social share images resolve correctly.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "EzEng";

export const SITE_TITLE = "EzEng — Learn English for Myanmar (Burmese) Speakers";

export const SITE_DESCRIPTION =
  "Free flashcards for Burmese speakers learning English. Practice English words, phrases, and idioms with Myanmar meanings, IPA, and audio pronunciation. အင်္ဂလိပ်စာ လွယ်ကူစွာ လေ့လာပါ။";

// Bilingual keywords so the app surfaces for both English and Burmese searches.
export const SITE_KEYWORDS = [
  "learn English",
  "English for Myanmar",
  "English for Burmese speakers",
  "Burmese to English",
  "English flashcards",
  "English vocabulary",
  "words phrases idioms",
  "English pronunciation IPA",
  "Myanmar English learning app",
  "အင်္ဂလိပ်စာ",
  "အင်္ဂလိပ်စာ လေ့လာ",
  "အင်္ဂလိပ်လို ပြောနည်း",
  "မြန်မာ အင်္ဂလိပ် flashcard",
];
