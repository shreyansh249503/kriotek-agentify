import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream, WritableStream, TransformStream } from "stream/web";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  (global as unknown as Record<string, unknown>).TextDecoder = TextDecoder;
}
if (typeof global.ReadableStream === "undefined") {
  (global as unknown as Record<string, unknown>).ReadableStream = ReadableStream as unknown as typeof global.ReadableStream;
}
if (typeof global.WritableStream === "undefined") {
  (global as unknown as Record<string, unknown>).WritableStream = WritableStream as unknown as typeof global.WritableStream;
}
if (typeof global.TransformStream === "undefined") {
  (global as unknown as Record<string, unknown>).TransformStream = TransformStream as unknown as typeof global.TransformStream;
}

if (typeof global.Request === "undefined") {
  (global as unknown as Record<string, unknown>).Request = class MockRequest {
    private body: unknown;
    headers: Headers;

    constructor(_url: string, init?: { body?: string; headers?: HeadersInit }) {
      this.body = init?.body ?? "";
      this.headers = new Headers(init?.headers);
    }

    json() {
      return Promise.resolve(typeof this.body === "string" ? JSON.parse(this.body) : this.body);
    }

    text() {
      return Promise.resolve(typeof this.body === "string" ? this.body : JSON.stringify(this.body));
    }
  };
}

if (typeof global.Response === "undefined" || !global.Response.json) {
  (global as unknown as Record<string, unknown>).Response = class MockResponse {
    status: number;
    headers: Map<string, string>;
    body: unknown;

    constructor(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = new Map(Object.entries(init?.headers || {}));
    }

    static json(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      return new MockResponse(JSON.stringify(data), init);
    }

    json() {
      return Promise.resolve(typeof this.body === "string" ? JSON.parse(this.body) : this.body);
    }

    text() {
      return Promise.resolve(String(this.body));
    }
  };
}
