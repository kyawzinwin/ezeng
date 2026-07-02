import type { Card } from "./types";

/**
 * Fallback deck used when Supabase env vars are not configured yet, so the app
 * runs out of the box. Once Supabase is set up, real data takes over.
 */
export const SAMPLE_CARDS: Card[] = [
  {
    id: "s1",
    type: "word",
    english: "generous",
    burmese: "ရက်ရောသော",
    example_en: "She is generous with her time.",
    example_my: "သူမသည် သူမ၏အချိန်ကို ရက်ရောစွာ ပေးတတ်သည်။",
    pronunciation: "/ˈdʒɛn.ər.əs/",
    audio_url: null,
    category: "personality",
  },
  {
    id: "s2",
    type: "word",
    english: "curious",
    burmese: "စူးစမ်းလိုစိတ်ရှိသော",
    example_en: "Children are naturally curious.",
    example_my: "ကလေးများသည် သဘာဝအားဖြင့် စူးစမ်းလိုစိတ်ရှိကြသည်။",
    pronunciation: "/ˈkjʊə.ri.əs/",
    audio_url: null,
    category: "personality",
  },
  {
    id: "s3",
    type: "phrase",
    english: "on the other hand",
    burmese: "တစ်ဖက်တွင်မူ",
    example_en: "It is cheap; on the other hand, the quality is poor.",
    example_my: "ဒါက ဈေးပေါတယ်၊ တစ်ဖက်တွင်မူ အရည်အသွေးက ညံ့တယ်။",
    pronunciation: null,
    audio_url: null,
    category: "linking",
  },
  {
    id: "s4",
    type: "phrase",
    english: "make up your mind",
    burmese: "ဆုံးဖြတ်ချက်ချပါ",
    example_en: "Please make up your mind before we leave.",
    example_my: "မထွက်ခွာမီ ဆုံးဖြတ်ချက်ချပါ။",
    pronunciation: null,
    audio_url: null,
    category: "everyday",
  },
  {
    id: "s5",
    type: "idiom",
    english: "a piece of cake",
    burmese: "အလွန်လွယ်ကူသော အရာ",
    example_en: "The exam was a piece of cake.",
    example_my: "စာမေးပွဲက အလွန်လွယ်ကူတယ်။",
    pronunciation: null,
    audio_url: null,
    category: "difficulty",
  },
  {
    id: "s6",
    type: "idiom",
    english: "break the ice",
    burmese: "အစပျိုးစကားပြောခြင်း",
    example_en: "He told a joke to break the ice.",
    example_my: "အစပျိုးစကားပြောရန် သူ ဟာသတစ်ခု ပြောခဲ့သည်။",
    pronunciation: null,
    audio_url: null,
    category: "social",
  },
];
