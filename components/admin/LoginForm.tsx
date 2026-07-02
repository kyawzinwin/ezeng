"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-sand bg-card p-6"
    >
      <p className="text-center text-muted">Sign in to manage cards.</p>
      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-sand bg-cream px-4 py-2 text-ink outline-none focus:border-accent"
      />
      <input
        type="password"
        required
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-lg border border-sand bg-cream px-4 py-2 text-ink outline-none focus:border-accent"
      />
      {error && <p className="text-sm text-accent">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-accent px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
