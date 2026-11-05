import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The one service-role Supabase client for server code. It bypasses RLS, so it must never
 * reach the browser.
 *
 * Created on first use rather than at import, so importing a route doesn't throw during
 * `next build` (or in tests) when the env vars aren't set.
 */
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY");

  client = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

/** Same client as getSupabaseAdmin(), usable as a plain import; it's created on first access. */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const real = getSupabaseAdmin();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
