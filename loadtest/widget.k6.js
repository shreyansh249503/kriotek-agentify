// Load test for the public widget API. Run against STAGING only, never production.
//
//   k6 run -e BASE_URL=https://staging.example.com -e PUBLIC_KEY=pk_xxx \
//          -e ORIGIN=https://allowed-site.example -e CHAT_RATE=2 loadtest/widget.k6.js
//
// Scenarios:
//   browse - bot config + live-support polling. No AI calls, cheap; this is the bulk of real traffic.
//   chat   - real chat messages. Every request calls Gemini and costs money: keep CHAT_RATE low
//            and use a test bot with a small monthly_token_budget.
//
// Rate limits are per IP (chat 20/min, polling 180/min, bot config 60/min). From one machine you
// will mostly measure the rate limiter: 429s are counted separately and are expected. To measure
// capacity, run from several machines (k6 cloud / distributed) or raise limits on staging.

import http from "k6/http";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL;
const PUBLIC_KEY = __ENV.PUBLIC_KEY;
const ORIGIN = __ENV.ORIGIN || BASE_URL;
const CHAT_RATE = Number(__ENV.CHAT_RATE || 1);
const BROWSE_RATE = Number(__ENV.BROWSE_RATE || 20);
const DURATION = __ENV.DURATION || "2m";

if (!BASE_URL || !PUBLIC_KEY) {
  throw new Error("Set BASE_URL and PUBLIC_KEY (see header comment)");
}

const rateLimited = new Counter("rate_limited_429");
const serverErrors = new Counter("server_errors_5xx");
const chatDuration = new Trend("chat_duration", true);

export const options = {
  scenarios: {
    browse: {
      executor: "constant-arrival-rate",
      exec: "browse",
      rate: BROWSE_RATE,
      timeUnit: "1s",
      duration: DURATION,
      preAllocatedVUs: 20,
      maxVUs: 200,
    },
    chat: {
      executor: "constant-arrival-rate",
      exec: "chat",
      rate: CHAT_RATE,
      timeUnit: "1s",
      duration: DURATION,
      preAllocatedVUs: 5,
      maxVUs: 50,
    },
  },
  thresholds: {
    // Cheap endpoints should stay fast under load.
    "http_req_duration{scenario:browse}": ["p(95)<800"],
    // Chat includes the full Gemini response.
    chat_duration: ["p(95)<15000"],
    // Any 5xx is a real failure; 429s are the rate limiter doing its job.
    server_errors_5xx: ["count==0"],
  },
};

const headers = { "Content-Type": "application/json", Origin: ORIGIN };

function record(res) {
  if (res.status === 429) rateLimited.add(1);
  if (res.status >= 500) serverErrors.add(1);
}

function uuid() {
  // RFC 4122 v4, good enough for test conversation IDs
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function browse() {
  const config = http.get(`${BASE_URL}/api/public/bot/${PUBLIC_KEY}`, { headers, tags: { name: "bot_config" } });
  record(config);
  check(config, { "bot config 200/429": (r) => r.status === 200 || r.status === 429 });

  const poll = http.get(`${BASE_URL}/api/public/conversation/${uuid()}?publicKey=${PUBLIC_KEY}`, {
    headers,
    tags: { name: "conversation_poll" },
  });
  record(poll);
  check(poll, { "poll 200/429": (r) => r.status === 200 || r.status === 429 });
}

const QUESTIONS = [
  "What do you sell?",
  "Do you ship internationally?",
  "What is your return policy?",
  "Can you recommend something under $50?",
];

export function chat() {
  const res = http.post(
    `${BASE_URL}/api/chat`,
    JSON.stringify({
      publicKey: PUBLIC_KEY,
      conversationId: uuid(),
      message: QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)],
    }),
    { headers, timeout: "60s", tags: { name: "chat" } },
  );
  record(res);
  if (res.status === 200) chatDuration.add(res.timings.duration);
  check(res, { "chat 200/429": (r) => r.status === 200 || r.status === 429 });
}
