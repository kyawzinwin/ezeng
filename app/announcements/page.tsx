import Link from "next/link";
import { getPublishedAnnouncements } from "@/lib/announcements";
import { formatDate } from "@/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Announcements",
  description: "What's new in EzEng — latest additions and updates.",
};

export default async function AnnouncementsPage() {
  // ponytail: fetch up to 100; add pagination if the list ever outgrows that.
  const posts = await getPublishedAnnouncements(100);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Announcements</h1>
        <Link href="/" className="text-sm text-accent hover:underline">
          ← Back to app
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {posts.map((post) => (
          <li
            key={post.id}
            className="rounded-2xl border border-sand bg-card p-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold text-ink">{post.title}</p>
              <time
                className="shrink-0 text-xs text-muted"
                dateTime={post.published_on}
              >
                {formatDate(post.published_on)}
              </time>
            </div>
            {post.body && <p className="mt-1 text-sm text-muted">{post.body}</p>}
          </li>
        ))}
        {posts.length === 0 && (
          <li className="rounded-2xl border border-dashed border-sand px-4 py-10 text-center text-muted">
            No announcements yet.
          </li>
        )}
      </ul>
    </main>
  );
}
