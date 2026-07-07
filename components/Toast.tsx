"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";

export interface Toast {
  id: number;
  message: string;
  kind: "success" | "error";
}

/** Minimal toast state: `notify()` shows a message that auto-dismisses. */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback(
    (message: string, kind: Toast["kind"] = "success") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, kind }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
    },
    [],
  );

  return { toasts, notify };
}

/** Top-right stack of toasts. Render once near the component using `useToasts`. */
export function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-lg ${
              t.kind === "error" ? "bg-accent" : "bg-ink"
            }`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
