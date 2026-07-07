"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import type { Announcement } from "@/lib/types";

const SEEN_KEY = "ez_announcement_seen";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // show at most once a day per announcement

// Suppress the toast if the same announcement was shown within the cooldown;
// a newer announcement (different id) always shows immediately.
function recentlyShown(latestId: string): boolean {
  try {
    const { id, ts } = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}");
    return id === latestId && Date.now() - ts < COOLDOWN_MS;
  } catch {
    return false; // no/old record → show
  }
}

function markShown(latestId: string) {
  localStorage.setItem(SEEN_KEY, JSON.stringify({ id: latestId, ts: Date.now() }));
}

/**
 * Top-right toast announcing the latest update. Shows at most once per day per
 * announcement (survives refresh/navigation), and immediately when a newer one
 * is published. Data is fetched server-side (see AnnouncementsWidget).
 */
export default function AnnouncementsToast({ posts }: { posts: Announcement[] }) {
  const [show, setShow] = useState(false);
  const latestId = posts[0]?.id;

  useEffect(() => {
    // Read localStorage after mount only — reading during render would
    // mismatch the server HTML. eslint-disable: syncing with an external store.
    if (!latestId || recentlyShown(latestId)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);
    markShown(latestId); // start the cooldown as soon as it's displayed
    const t = setTimeout(() => setShow(false), 5000); // auto-hide after 5s
    return () => clearTimeout(t);
  }, [latestId]);

  function dismiss() {
    setShow(false);
    if (latestId) markShown(latestId);
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-full max-w-xs">
      <AnimatePresence>
        {show && (
          <motion.section
            aria-label="Latest updates"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="pointer-events-auto rounded-2xl border border-sand bg-card p-4 shadow-lg"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent-soft" />
              <h2 className="flex-1 text-xs font-semibold uppercase tracking-widest text-muted">
                Latest updates
              </h2>
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="text-muted transition hover:text-accent"
              >
                ✕
              </button>
            </div>
            <ul className="flex flex-col gap-3">
              {posts.map((post) => (
                <li key={post.id} className="flex flex-col gap-0.5">
                  <p className="font-semibold text-ink">{post.title}</p>
                  {post.body && <p className="text-sm text-muted">{post.body}</p>}
                  <time
                    className="text-xs text-muted"
                    dateTime={post.published_on}
                  >
                    {formatDate(post.published_on)}
                  </time>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
