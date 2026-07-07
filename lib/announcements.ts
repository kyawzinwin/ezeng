import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";
import type { Announcement } from "./types";

// Sample post shown when Supabase isn't configured, so the widget renders
// something out of the box (mirrors SAMPLE_CARDS).
const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "Added 6 starter cards",
    body: "Words, phrases, and idioms to get you going.",
    category: "new-cards",
    published: true,
    published_on: new Date().toISOString().slice(0, 10),
  },
];

/**
 * Latest published announcements for the homepage widget. Falls back to the
 * sample post when Supabase is unconfigured or unreachable.
 */
export async function getPublishedAnnouncements(
  limit = 5,
): Promise<Announcement[]> {
  if (!isSupabaseConfigured) return SAMPLE_ANNOUNCEMENTS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("published", true)
    .order("published_on", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to load announcements:", error.message);
    return [];
  }
  return (data as Announcement[]) ?? [];
}

/** Read a boolean flag from app_settings; `fallback` when missing/unconfigured. */
export async function getBoolSetting(
  key: string,
  fallback: boolean,
): Promise<boolean> {
  if (!isSupabaseConfigured) return fallback;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) return fallback;
  return data.value === true;
}
