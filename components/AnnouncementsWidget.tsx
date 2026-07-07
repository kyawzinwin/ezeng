import AnnouncementsToast from "@/components/AnnouncementsToast";
import { getBoolSetting, getPublishedAnnouncements } from "@/lib/announcements";

// Fetches published posts server-side and hands them to the client toast.
// Renders nothing when the master switch is off or there's nothing to show.
export default async function AnnouncementsWidget() {
  const enabled = await getBoolSetting("announcements_widget_enabled", true);
  if (!enabled) return null;

  const posts = await getPublishedAnnouncements(1);
  if (posts.length === 0) return null;

  return <AnnouncementsToast posts={posts} />;
}
