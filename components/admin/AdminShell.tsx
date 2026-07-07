"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconCards, IconGrid, IconMegaphone } from "./ui";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: <IconGrid /> },
  { href: "/admin/cards", label: "Cards", icon: <IconCards /> },
  {
    href: "/admin/announcements",
    label: "Announcements",
    icon: <IconMegaphone />,
  },
];

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.refresh();
  }

  return (
    <main className="w-full flex-1">
      <div className="mx-auto flex max-w-6xl flex-col md:min-h-[calc(100vh-4rem)] md:flex-row">
        {/* Sidebar */}
        <aside className="border-b border-sand bg-card md:w-64 md:shrink-0 md:border-b-0 md:border-r">
          <div className="flex flex-col gap-6 p-5 md:sticky md:top-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-ink">
                Ez<span className="text-accent">Eng</span>
              </span>
              <span className="rounded-md bg-accent-soft/20 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-accent">
                Admin
              </span>
            </Link>

            <nav className="flex gap-1.5 md:flex-col">
              {NAV.map((n) => {
                // Exact match for dashboard; prefix match for sub-sections.
                const on =
                  n.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={on ? "page" : undefined}
                    className={`flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition md:flex-none ${
                      on
                        ? "bg-accent-soft/20 text-ink"
                        : "text-muted hover:bg-sand/60 hover:text-ink"
                    }`}
                  >
                    <span className={on ? "text-accent" : ""}>{n.icon}</span>
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-sand bg-cream/80 px-5 py-3 backdrop-blur md:px-8">
            <div className="hidden text-right text-xs sm:block">
              <p className="font-semibold text-ink">Signed in</p>
              <p className="max-w-[12rem] truncate text-muted">{email}</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-bold text-white">
              {email[0]?.toUpperCase()}
            </span>
            <button
              onClick={signOut}
              className="rounded-lg border border-sand px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
            >
              Sign out
            </button>
          </header>

          <div className="p-5 md:p-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
