import AdminShell from "@/components/admin/AdminShell";
import LoginForm from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// Keep the whole admin area out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured) {
    return (
      <Centered>
        <div className="rounded-2xl border border-sand bg-card p-6 text-center text-muted">
          <p className="font-semibold text-ink">Supabase not configured</p>
          <p className="mt-2 text-sm">
            Add your keys to <code>.env.local</code> to enable the admin area.
            See <code>README.md</code>.
          </p>
        </div>
      </Centered>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate the UI here; the DB is protected by Supabase RLS regardless.
  if (!user) {
    return (
      <Centered>
        <LoginForm />
      </Centered>
    );
  }

  return <AdminShell email={user.email!}>{children}</AdminShell>;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 items-center px-5 py-16">
      <div className="w-full">{children}</div>
    </main>
  );
}
