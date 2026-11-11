import axios from "axios";

/**
 * A message to show the user for a failed API call: the API's own `error`, followed by its
 * `details` list when there is one (e.g. "Some bot settings are invalid: name: ...; tone: ...").
 */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const data = axios.isAxiosError(err) ? err.response?.data : undefined;
  const message = typeof data?.error === "string" ? data.error : null;
  const details = Array.isArray(data?.details) ? data.details.filter((d: unknown) => typeof d === "string") : [];

  if (message && details.length) return `${message}: ${details.join("; ")}`;
  if (message) return message;
  return fallback;
}
