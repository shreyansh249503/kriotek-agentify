import { supabase } from "@/lib/supabase";

export const uploadImage = async (file: File): Promise<{ url?: string; error?: string }> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    body: formData,
  });

  return res.json();
};
