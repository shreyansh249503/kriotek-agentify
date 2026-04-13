import { supabase } from "@/lib/supabase";

const MODELS_BASE = "/api/models";
const ACTIVE_JOB_KEY = "agentify_lipsync_active_job";
const JOB_HISTORY_KEY = "agentify_lipsync_history";
const MAX_HISTORY = 3;

// ── Saved avatar ────────────────────────────────────────────────────────────

export interface SavedAvatar {
  id: string;
  name: string;
  avatar_prompt: string;
  image_data: string;
  created_at: string;
}

// ── Active job (persisted across page refreshes) ────────────────────────────

export interface ActiveJob {
  jobId: string;
  prompt: string;
  startedAt: number;
  /** base64 data URL — may be empty if storage was full */
  imageDataUrl: string;
  /** base64 data URL — may be empty if storage was full */
  audioDataUrl: string;
}

// ── Video history (completed jobs) ──────────────────────────────────────────

export interface VideoHistoryItem {
  jobId: string;
  prompt: string;
  completedAt: number;
  /** base64 data URL — may be empty if storage was full */
  videoDataUrl: string;
  thumbnailDataUrl: string;
}

// ── localStorage helpers ────────────────────────────────────────────────────

export function getActiveJob(): ActiveJob | null {
  try {
    const raw = localStorage.getItem(ACTIVE_JOB_KEY);
    return raw ? (JSON.parse(raw) as ActiveJob) : null;
  } catch {
    return null;
  }
}

export function saveActiveJob(job: ActiveJob): void {
  try {
    localStorage.setItem(ACTIVE_JOB_KEY, JSON.stringify(job));
  } catch {
    // Quota exceeded — store job ID + metadata only (no media blobs)
    try {
      const slim: ActiveJob = { ...job, imageDataUrl: "", audioDataUrl: "" };
      localStorage.setItem(ACTIVE_JOB_KEY, JSON.stringify(slim));
    } catch {}
  }
}

export function clearActiveJob(): void {
  try {
    localStorage.removeItem(ACTIVE_JOB_KEY);
  } catch {}
}

export function getVideoHistory(): VideoHistoryItem[] {
  try {
    const raw = localStorage.getItem(JOB_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as VideoHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function addToVideoHistory(item: VideoHistoryItem): void {
  const deduped = (history: VideoHistoryItem[]) =>
    [item, ...history.filter((h) => h.jobId !== item.jobId)].slice(0, MAX_HISTORY);

  try {
    localStorage.setItem(JOB_HISTORY_KEY, JSON.stringify(deduped(getVideoHistory())));
  } catch {
    // Quota exceeded — drop video blob and try again with just metadata
    try {
      const slim: VideoHistoryItem = { ...item, videoDataUrl: "" };
      localStorage.setItem(JOB_HISTORY_KEY, JSON.stringify(deduped(getVideoHistory()).map((h) => ({ ...h, videoDataUrl: "" }))));
      void slim; // slim already merged in deduped above as `item`
    } catch {}
  }
}

// ── Auth ────────────────────────────────────────────────────────────────────

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
}

// ── Saved avatar CRUD ───────────────────────────────────────────────────────

export async function getSavedAvatars(): Promise<SavedAvatar[]> {
  const res = await fetch("/api/avatars", { headers: await authHeaders() });
  if (!res.ok) throw new Error("Failed to load saved avatars");
  return res.json();
}

export async function saveAvatar(
  name: string,
  avatar_prompt: string,
  image_data: string,
): Promise<SavedAvatar> {
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

// ── Generation interfaces ───────────────────────────────────────────────────

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

// ── Image generation ────────────────────────────────────────────────────────

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
    throw new Error((err as { detail?: string }).detail ?? "Image generation failed");
  }
  return res.json();
}

// ── Speech generation ───────────────────────────────────────────────────────

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
    throw new Error((err as { detail?: string }).detail ?? "Speech generation failed");
  }
  return res.json();
}

// ── Lipsync — start job ─────────────────────────────────────────────────────

/**
 * Submits a new lipsync job to the EchoMimic server, persists the job ID +
 * inputs to localStorage (so the page can resume polling after a refresh),
 * and returns the job_id string.
 */
export async function startLipsyncJob(
  imageDataUrl: string,
  audioDataUrl: string,
  prompt: string,
): Promise<string> {
  const imageBlob = await fetch(imageDataUrl).then((r) => r.blob());
  const audioBlob = await fetch(audioDataUrl).then((r) => r.blob());

  const form = new FormData();
  form.append("image", imageBlob, "avatar.png");
  form.append("audio", audioBlob, "voice.wav");
  form.append("prompt", prompt);

  const startRes = await fetch(`${MODELS_BASE}/lipsync/generate`, {
    method: "POST",
    body: form,
  });
  if (!startRes.ok) {
    const err = await startRes.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "Failed to start lipsync job");
  }

  const { job_id } = await startRes.json() as { job_id: string };

  // Persist so a page refresh can resume polling
  saveActiveJob({ jobId: job_id, prompt, startedAt: Date.now(), imageDataUrl, audioDataUrl });

  return job_id;
}

// ── Lipsync — poll existing job ─────────────────────────────────────────────

/**
 * Polls /lipsync/status/{jobId} every 5 s until the job is done or failed.
 * Clears the persisted active job from localStorage when finished.
 * Throws a descriptive error if the server restarted (404) or job failed.
 */
export async function pollLipsyncJob(jobId: string): Promise<GeneratedVideo> {
  const deadline = Date.now() + 30 * 60 * 1000; // 30-minute hard cap
  let jobDone = false;

  while (Date.now() < deadline) {
    await new Promise<void>((r) => setTimeout(r, 5000));

    const statusRes = await fetch(`${MODELS_BASE}/lipsync/status/${jobId}`);

    if (statusRes.status === 404) {
      clearActiveJob();
      throw new Error(
        "Job not found — the server may have restarted. Please generate a new video.",
      );
    }
    if (!statusRes.ok && statusRes.status !== 500) {
      throw new Error(`Status check failed (HTTP ${statusRes.status})`);
    }

    const { status, error } = await statusRes.json() as { status: string; error?: string };

    if (status === "failed") {
      clearActiveJob();
      throw new Error(error ?? "Lipsync job failed");
    }
    if (status === "done") {
      jobDone = true;
      break;
    }
  }

  if (!jobDone) {
    clearActiveJob();
    throw new Error("Lipsync job timed out after 30 minutes");
  }

  const resultRes = await fetch(`${MODELS_BASE}/lipsync/result/${jobId}`);
  if (!resultRes.ok) {
    clearActiveJob();
    const err = await resultRes.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "Failed to fetch lipsync result");
  }

  clearActiveJob();
  return resultRes.json() as Promise<GeneratedVideo>;
}

// ── Lipsync — combined legacy helper ───────────────────────────────────────

export async function generateLipsync(
  imageDataUrl: string,
  audioDataUrl: string,
  prompt: string,
  _options?: { seconds?: number; width?: number; height?: number; num_inference_steps?: number },
): Promise<GeneratedVideo> {
  const jobId = await startLipsyncJob(imageDataUrl, audioDataUrl, prompt);
  return pollLipsyncJob(jobId);
}
