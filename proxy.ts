import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Site-wide password gate (HTTP Basic Auth) for while the app is still being
 * built. Enabled only when SITE_PASSWORD is set — so it's off locally and on
 * in Vercel once you add the env var. Not high security; just keeps the public
 * out. The admin area still has its own Supabase auth + RLS on top.
 */
function passwordGate(request: NextRequest): NextResponse | null {
  const password = process.env.SITE_PASSWORD;
  if (!password) return null; // gate disabled

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const given = decoded.slice(decoded.indexOf(":") + 1); // pass after "user:"
    if (given === password) return null; // authorized
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Site under construction"' },
  });
}

export async function proxy(request: NextRequest) {
  const gate = passwordGate(request);
  if (gate) return gate;

  const response = NextResponse.next({ request });

  // Keep the Supabase auth session fresh on the admin area only.
  if (!isSupabaseConfigured || !request.nextUrl.pathname.startsWith("/admin")) {
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Run on every route except static assets and image optimization, so the
  // password gate covers the whole site.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
