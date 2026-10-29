import * as Sentry from "@sentry/nextjs";

// Runs once when a Next.js server instance starts.
export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
    return;
  }
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  await import("./sentry.server.config");

  // Skip the build: CI and `next build` don't need runtime secrets.
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { assertServerEnv } = await import("./lib/env");
  assertServerEnv();
}

// Reports errors thrown while rendering pages and route handlers.
export const onRequestError = Sentry.captureRequestError;
