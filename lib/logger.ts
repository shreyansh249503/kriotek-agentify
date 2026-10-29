type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  time: string;
  msg: string;
  module?: string;
  [key: string]: unknown;
}

const PII_KEYS = new Set([
  "email",
  "phone",
  "phonenumber",
  "phone_number",
  "token",
  "accesstoken",
  "access_token",
  "password",
  "secret",
  "authorization",
  "cookie",
  "creditcard",
  "credit_card",
  "ssn",
]);

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

/**
 * Sanitize objects or primitives to ensure zero customer PII is leaked into logs.
 */
export function sanitizeLogData(data: unknown, depth = 0): unknown {
  if (depth > 5) return "[MaxDepth]";
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    return data
      .replace(EMAIL_REGEX, "[REDACTED_EMAIL]")
      .replace(PHONE_REGEX, "[REDACTED_PHONE]");
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return data;
  }

  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message.replace(EMAIL_REGEX, "[REDACTED_EMAIL]"),
      stack: data.stack ? data.stack.replace(EMAIL_REGEX, "[REDACTED_EMAIL]") : undefined,
    };
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item, depth + 1));
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (PII_KEYS.has(lowerKey)) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeLogData(value, depth + 1);
      }
    }
    return sanitized;
  }

  return String(data);
}

export class Logger {
  private readonly defaultMeta: Record<string, unknown>;

  constructor(defaultMeta: Record<string, unknown> = {}) {
    this.defaultMeta = defaultMeta;
  }

  child(bindings: Record<string, unknown>): Logger {
    return new Logger({ ...this.defaultMeta, ...bindings });
  }

  private write(level: LogLevel, msg: string, meta?: Record<string, unknown>) {
    // If in test environment and not explicitly requested, suppress routine logs to keep test output clean
    if (process.env.NODE_ENV === "test" && !process.env.DEBUG_TESTS) {
      return;
    }

    const payload: LogPayload = {
      level,
      time: new Date().toISOString(),
      msg: typeof msg === "string" ? (sanitizeLogData(msg) as string) : String(msg),
      ...this.defaultMeta,
      ...(meta ? (sanitizeLogData(meta) as Record<string, unknown>) : {}),
    };

    const serialized = JSON.stringify(payload);
    if (level === "error") {
      process.stderr.write(serialized + "\n");
    } else {
      process.stdout.write(serialized + "\n");
    }
  }

  debug(msg: string, meta?: Record<string, unknown>) {
    this.write("debug", msg, meta);
  }

  info(msg: string, meta?: Record<string, unknown>) {
    this.write("info", msg, meta);
  }

  warn(msg: string, meta?: Record<string, unknown>) {
    this.write("warn", msg, meta);
  }

  error(msg: string, errorOrMeta?: unknown, extraMeta?: Record<string, unknown>) {
    let meta: Record<string, unknown> = {};
    if (errorOrMeta instanceof Error) {
      meta.error = {
        name: errorOrMeta.name,
        message: errorOrMeta.message,
        stack: errorOrMeta.stack,
      };
      if (extraMeta) {
        meta = { ...meta, ...extraMeta };
      }
    } else if (typeof errorOrMeta === "object" && errorOrMeta !== null) {
      meta = { ...errorOrMeta as Record<string, unknown>, ...(extraMeta || {}) };
    } else if (errorOrMeta !== undefined) {
      meta.detail = String(errorOrMeta);
    }
    this.write("error", msg, meta);
  }
}

export const logger = new Logger();

