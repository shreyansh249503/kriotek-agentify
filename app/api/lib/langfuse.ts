import { Langfuse } from "langfuse";
import crypto from "crypto";

let langfuseInstance: Langfuse | null = null;

export function getLangfuseClient(): Langfuse | null {
  if (langfuseInstance) {
    return langfuseInstance;
  }

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl =
    process.env.LANGFUSE_BASEURL ||
    process.env.LANGFUSE_HOST ||
    "https://cloud.langfuse.com";

  if (!publicKey || !secretKey) {
    return null;
  }

  try {
    langfuseInstance = new Langfuse({
      publicKey,
      secretKey,
      baseUrl,
      flushAt: 1,
      flushInterval: 1000,
    });
    return langfuseInstance;
  } catch (error) {
    console.warn("Failed to initialize Langfuse client:", error);
    return null;
  }
}

export interface TraceContextOptions {
  botId?: string;
  botName?: string;
  storeId?: string;
  storeDomain?: string;
  conversationId?: string;
  userMessage?: string;
  userId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface TraceHandle {
  traceId: string;
  recordSpan: (name: string, input?: unknown, output?: unknown, metadata?: Record<string, unknown>) => void;
  recordGeneration: (params: {
    name: string;
    model: string;
    input: unknown;
    output: unknown;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
    startTime?: Date;
    endTime?: Date;
    metadata?: Record<string, unknown>;
  }) => void;
}

export function createChatTrace(options: TraceContextOptions): TraceHandle {
  const traceId = `trace_${options.conversationId || crypto.randomUUID()}_${Date.now()}`;
  const client = getLangfuseClient();

  if (!client) {
    return {
      traceId,
      recordSpan: () => {},
      recordGeneration: () => {},
    };
  }

  const traceTags = [
    "retail-pro",
    options.storeDomain ? `store:${options.storeDomain}` : null,
    options.botId ? `bot:${options.botId}` : null,
    ...(options.tags || []),
  ].filter(Boolean) as string[];

  const trace = client.trace({
    id: traceId,
    name: "retail-chat-interaction",
    sessionId: options.conversationId,
    userId: options.userId || options.storeDomain || options.botId,
    input: options.userMessage ? { message: options.userMessage } : undefined,
    tags: traceTags,
    metadata: {
      botId: options.botId,
      botName: options.botName,
      storeId: options.storeId,
      storeDomain: options.storeDomain,
      conversationId: options.conversationId,
      ...options.metadata,
    },
  });

  return {
    traceId,
    recordSpan: (name: string, input?: unknown, output?: unknown, metadata?: Record<string, unknown>) => {
      try {
        trace.span({
          name,
          input,
          output,
          metadata,
        });
      } catch (err) {
        console.warn(`[Langfuse] Failed to record span '${name}':`, err);
      }
    },
    recordGeneration: (params) => {
      try {
        trace.generation({
          name: params.name,
          model: params.model,
          input: params.input,
          output: params.output,
          usage: params.usage
            ? {
                promptTokens: params.usage.promptTokens,
                completionTokens: params.usage.completionTokens,
                totalTokens: params.usage.totalTokens,
              }
            : undefined,
          startTime: params.startTime,
          endTime: params.endTime || new Date(),
          metadata: params.metadata,
        });
      } catch (err) {
        console.warn(`[Langfuse] Failed to record generation '${params.name}':`, err);
      }
    },
  };
}

export interface ScoreOptions {
  traceId: string;
  name?: string;
  value: number;
  comment?: string;
  dataType?: "NUMERIC" | "BOOLEAN" | "CATEGORICAL";
  metadata?: Record<string, unknown>;
}

export async function recordFeedbackScore(options: ScoreOptions): Promise<boolean> {
  const client = getLangfuseClient();
  if (!client) {
    return false;
  }

  try {
    client.score({
      traceId: options.traceId,
      name: options.name || "user_feedback",
      value: options.value,
      comment: options.comment,
      dataType: options.dataType || "NUMERIC",
      metadata: options.metadata,
    });
    await client.flushAsync();
    return true;
  } catch (error) {
    console.warn("[Langfuse] Failed to record feedback score:", error);
    return false;
  }
}

export async function flushLangfuse(): Promise<void> {
  const client = getLangfuseClient();
  if (client) {
    try {
      await client.flushAsync();
    } catch (err) {
      console.warn("[Langfuse] Error during flushAsync:", err);
    }
  }
}
