import { supabase } from "@/lib/supabase";

const MODELS_BASE = "/api/models";

export interface SavedAvatar {
  id: string;
  name: string;
  avatar_prompt: string;
  image_data: string;
  created_at: string;
}

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
}

export async function getSavedAvatars(): Promise<SavedAvatar[]> {
  const res = await fetch("/api/avatars", { headers: await authHeaders() });
  if (!res.ok) throw new Error("Failed to load saved avatars");
  return res.json();
}

export async function saveAvatar(name: string, avatar_prompt: string, image_data: string): Promise<SavedAvatar> {
  const res = await fetch("/api/avatars", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ name, avatar_prompt, image_data }),
  });
  if (!res.ok) throw new Error("Failed to save avatar");
  return res.json();
}

export async function deleteSavedAvatar(id: string): Promise<void> {
  const res = await fetch(`/api/avatars/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete avatar");
}

export interface GeneratedImage {
  image: string; // data:image/png;base64,...
  width: number;
  height: number;
}

export interface GeneratedAudio {
  audio: string; // data:audio/wav;base64,...
  sample_rate: number;
  duration_seconds: number;
}

export interface GeneratedVideo {
  video: string; // data:video/mp4;base64,...
  duration_seconds: number;
  width: number;
  height: number;
  frames: number;
}

export async function generateImage(
  prompt: string,
  options?: { negative_prompt?: string; width?: number; height?: number; steps?: number },
): Promise<GeneratedImage> {
  const res = await fetch(`${MODELS_BASE}/image/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, ...options }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Image generation failed");
  }
  return res.json();
}

export async function generateSpeech(
  text: string,
  options?: { voice?: string; temperature?: number; top_p?: number; seed?: number },
): Promise<GeneratedAudio> {
  const form = new FormData();
  form.append("text", text);
  if (options?.voice !== undefined) form.append("voice", options.voice);
  if (options?.temperature !== undefined) form.append("temperature", String(options.temperature));
  if (options?.top_p !== undefined) form.append("top_p", String(options.top_p));
  if (options?.seed !== undefined) form.append("seed", String(options.seed));

  const res = await fetch(`${MODELS_BASE}/tts/generate`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Speech generation failed");
  }
  return res.json();
}

export async function generateLipsync(
  imageDataUrl: string,
  audioDataUrl: string,
  prompt: string,
  options?: { seconds?: number; width?: number; height?: number; num_inference_steps?: number },
): Promise<GeneratedVideo> {
  const imageBlob = await fetch(imageDataUrl).then((r) => r.blob());
  const audioBlob = await fetch(audioDataUrl).then((r) => r.blob());

  const form = new FormData();
  form.append("image", imageBlob, "avatar.png");
  form.append("audio", audioBlob, "voice.wav");
  form.append("prompt", prompt);

  // Start job
  const startRes = await fetch(`${MODELS_BASE}/lipsync/generate`, { method: "POST", body: form });
  if (!startRes.ok) {
    const err = await startRes.json().catch(() => ({}));
    throw new Error(err.detail ?? "Failed to start lipsync job");
  }
  const { job_id } = await startRes.json();

  // Poll until done (every 5s, up to 30 minutes)
  const deadline = Date.now() + 30 * 60 * 1000;
  let jobDone = false;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(`${MODELS_BASE}/lipsync/status/${job_id}`);
    if (!statusRes.ok && statusRes.status !== 500) {
      throw new Error(`Status check failed (HTTP ${statusRes.status})`);
    }
    const { status, error } = await statusRes.json();
    if (status === "failed") throw new Error(error ?? "Lipsync job failed");
    if (status === "done") { jobDone = true; break; }
  }

  if (!jobDone) throw new Error("Lipsync job timed out after 30 minutes");

  // Fetch result
  const resultRes = await fetch(`${MODELS_BASE}/lipsync/result/${job_id}`);
  if (!resultRes.ok) {
    const err = await resultRes.json().catch(() => ({}));
    throw new Error(err.detail ?? "Failed to fetch lipsync result");
  }
  return resultRes.json();
}
