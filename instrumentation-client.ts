import * as Sentry from "@sentry/nextjs";
import { sentryDataCollection } from "@/lib/sentryPrivacy";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  dataCollection: sentryDataCollection,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
