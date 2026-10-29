import type * as Sentry from "@sentry/nextjs";

type DataCollection = NonNullable<NonNullable<Parameters<typeof Sentry.init>[0]>["dataCollection"]>;

/**
 * What Sentry may collect. Sentry's defaults collect request/response bodies, headers, cookies,
 * DB query parameters, local variables and AI inputs/outputs, which here would mean chat
 * transcripts, shopper emails and phones, session cookies and Shopify access tokens. Errors are
 * still reported with stack traces, routes and messages; none of that payload data is sent.
 */
export const sentryDataCollection: DataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
  graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false },
  mcp: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  stackFrameVariables: false,
};
