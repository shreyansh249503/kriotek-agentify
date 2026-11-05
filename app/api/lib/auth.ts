import { supabaseAdmin } from "./supabase-admin";

export async function getUserFromRequest(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  const { data } = await supabaseAdmin.auth.getUser(token);
  return data?.user ?? null;
}
