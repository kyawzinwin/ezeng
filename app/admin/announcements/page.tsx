import AnnouncementManager from "@/components/admin/AnnouncementManager";
import { Panel } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import type { Announcement } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();
  const [{ data }, { data: setting }] = await Promise.all([
    supabase
      .from("announcements")
      .select("*")
      .order("published_on", { ascending: false }),
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "announcements_widget_enabled")
      .maybeSingle(),
  ]);

  const announcements = (data as Announcement[]) ?? [];

  return (
    <Panel title="All announcements" subtitle={`${announcements.length} total`}>
      <AnnouncementManager
        initialAnnouncements={announcements}
        initialWidgetEnabled={setting?.value !== false}
      />
    </Panel>
  );
}
