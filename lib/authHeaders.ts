import { supabase } from "@/lib/supabase";

/**
 * Authorization header for calls from the web dashboard to our own API.
 * Use this with plain fetch() (e.g. FormData uploads); axiosInstance already
 * adds it automatically.
 */
export async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}
