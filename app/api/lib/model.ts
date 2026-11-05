export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";

/** The Gemini model every agent calls, so telemetry reports the model that was actually used. */
export function getModelName(env: NodeJS.ProcessEnv = process.env): string {
  return env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}
