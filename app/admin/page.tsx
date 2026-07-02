import Link from "next/link";
import CardManager from "@/components/admin/CardManager";
import LoginForm from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <div className="rounded-2xl border border-sand bg-card p-6 text-center text-muted">
          <p className="font-semibold text-ink">Supabase not configured</p>
          <p className="mt-2 text-sm">
            Add your keys to <code>.env.local</code> to enable the admin area.
            See <code>README.md</code>.
          </p>
        </div>
      </Shell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell>
        <LoginForm />
      </Shell>
    );
  }

  const { data } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <Shell>
      <CardManager initialCards={(data as Card[]) ?? []} email={user.email!} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Admin</h1>
        <Link href="/" className="text-sm text-accent hover:underline">
          ← Back to app
        </Link>
      </div>
      {children}
    </main>
  );
}
