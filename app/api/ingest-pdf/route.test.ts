import { POST } from "./route";
import { createEmbedding } from "../lib/embeddings";
import { getDb } from "../lib/db";
import * as Sentry from "@sentry/nextjs";

if (typeof Response === "undefined" || !Response.json) {
  (global as unknown as Record<string, unknown>).Response = class MockResponse {
    static json(data: unknown, init?: { status?: number }) {
      return {
        status: init?.status ?? 200,
        json: () => Promise.resolve(data),
      };
    }
  };
}

let mockPdfRawText = "Sample PDF extracted content text for testing.";
let shouldFailPdfParse = false;
let mockDataReadyCallback: () => void = () => {};
let mockDataErrorCallback: (err: unknown) => void = () => {};

jest.mock("pdf2json", () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: jest.fn((event, callback) => {
        if (event === "pdfParser_dataReady") {
          mockDataReadyCallback = callback;
        } else if (event === "pdfParser_dataError") {
          mockDataErrorCallback = callback;
        }
      }),
      parseBuffer: jest.fn(() => {
        if (shouldFailPdfParse) {
          mockDataErrorCallback(new Error("Corrupt PDF file"));
        } else {
          mockDataReadyCallback();
        }
      }),
      getRawTextContent: jest.fn(() => mockPdfRawText),
    };
  });
});

jest.mock("../lib/embeddings", () => ({
  createEmbedding: jest.fn(),
}));

jest.mock("../lib/db", () => ({
  getDb: jest.fn(),
}));

jest.mock("../lib/auth", () => ({
  getUserFromRequest: jest.fn(),
}));

jest.mock("@sentry/nextjs", () => ({ captureException: jest.fn() }));
jest.mock("../../../lib/logger", () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

import { getUserFromRequest } from "../lib/auth";

type JsonResponse = { status: number; json: () => Promise<Record<string, unknown>> };

const MB = 1024 * 1024;

describe("POST /api/ingest-pdf", () => {
  const mockedGetDb = getDb as jest.Mock;
  const mockedCreateEmbedding = createEmbedding as jest.Mock;
  const mockedGetUser = getUserFromRequest as jest.Mock;
  const mockFindOne = jest.fn().mockResolvedValue({ id: "bot-1", public_key: "pk_test" });

  // Fake transaction: statements run through txQuery; they only count as committed when the
  // callback finishes without throwing.
  const txQuery = jest.fn();
  const mockTransaction = jest.fn();
  let committed: unknown[][] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    shouldFailPdfParse = false;
    mockPdfRawText = "Sample PDF extracted content text for testing.";
    mockedGetUser.mockResolvedValue({ id: "user-123" });
    mockedCreateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
    committed = [];
    txQuery.mockReset().mockResolvedValue([]);
    mockTransaction.mockReset().mockImplementation(async (work: (m: { query: jest.Mock }) => Promise<unknown>) => {
      const before = txQuery.mock.calls.length;
      const result = await work({ query: txQuery });
      committed.push(...txQuery.mock.calls.slice(before));
      return result;
    });

    mockedGetDb.mockResolvedValue({
      getRepository: () => ({ findOne: mockFindOne }),
      query: jest.fn().mockResolvedValue([]),
      transaction: mockTransaction,
    });
  });

  const createMockRequest = (fields: { file?: unknown; publicKey?: unknown }, headers: Record<string, string> = {}) => {
    const formData = {
      get: (key: string) => {
        if (key === "file") return fields.file ?? null;
        if (key === "publicKey") return fields.publicKey ?? null;
        return null;
      },
    };

    return {
      formData: jest.fn().mockResolvedValue(formData),
      headers: new Headers(headers),
    } as unknown as Request;
  };

  const createMockFile = (content: string, size?: number) => {
    const bytes = new TextEncoder().encode(content);
    return {
      size: size ?? bytes.length,
      arrayBuffer: jest.fn().mockResolvedValue(bytes.buffer),
    };
  };
  const pdfFile = () => createMockFile("%PDF-1.7 valid pdf bytes");

  const post = async (req: Request) => (await POST(req)) as unknown as JsonResponse;
  const insertStatements = () => committed.filter(([sql]) => String(sql).startsWith("INSERT INTO bot_documents"));

  describe("access and input", () => {
    it("returns 401 if the user is not authenticated", async () => {
      mockedGetUser.mockResolvedValueOnce(null);

      const res = await post(createMockRequest({ file: pdfFile(), publicKey: "pk_test" }));

      expect(res.status).toBe(401);
      expect((await res.json()).error).toBe("Unauthorized");
    });

    it("returns 400 if file or publicKey is missing", async () => {
      const res = await post(createMockRequest({ publicKey: "pk_test" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("Missing file or publicKey");
    });

    it("returns 400 if the body isn't a form", async () => {
      const req = { formData: jest.fn().mockRejectedValue(new TypeError("bad form")), headers: new Headers() } as unknown as Request;

      const res = await post(req);

      expect(res.status).toBe(400);
    });
  });

  describe("limits", () => {
    it("rejects an upload over 4 MB from its Content-Length, before reading the body", async () => {
      const req = createMockRequest({ file: pdfFile(), publicKey: "pk_test" }, { "content-length": String(5 * MB) });

      const res = await post(req);

      expect(res.status).toBe(413);
      expect((await res.json()).error).toMatch(/4 MB/);
      expect((req as unknown as { formData: jest.Mock }).formData).not.toHaveBeenCalled();
    });

    it("rejects a file over 4 MB without reading it", async () => {
      const file = createMockFile("%PDF-1.7", 4 * MB + 1);

      const res = await post(createMockRequest({ file, publicKey: "pk_test" }));

      expect(res.status).toBe(413);
      expect(file.arrayBuffer).not.toHaveBeenCalled();
    });

    it("accepts a file of exactly 4 MB", async () => {
      const file = createMockFile("%PDF-1.7 content", 4 * MB);

      const res = await post(createMockRequest({ file, publicKey: "pk_test" }));

      expect(res.status).toBe(200);
    });

    it("rejects a file that isn't a PDF, whatever its name or type", async () => {
      const res = await post(createMockRequest({ file: createMockFile("<html>not a pdf</html>"), publicKey: "pk_test" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("This file isn't a PDF");
      expect(mockedCreateEmbedding).not.toHaveBeenCalled();
    });

    it("rejects a PDF with more than 200 chunks of text instead of cutting it short", async () => {
      mockPdfRawText = "x".repeat(800 * 200 + 1);

      const res = await post(createMockRequest({ file: pdfFile(), publicKey: "pk_test" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/too much text/);
      expect(mockedCreateEmbedding).not.toHaveBeenCalled();
    });

    it("accepts exactly 200 chunks", async () => {
      mockPdfRawText = "x".repeat(800 * 200);

      const res = await post(createMockRequest({ file: pdfFile(), publicKey: "pk_test" }));

      expect(res.status).toBe(200);
      expect((await res.json()).chunks).toBe(200);
    });
  });

  describe("unreadable PDFs", () => {
    it("returns 400 with a clear message when the PDF can't be parsed", async () => {
      shouldFailPdfParse = true;

      const res = await post(createMockRequest({ file: pdfFile(), publicKey: "pk_test" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/couldn't be read/);
    });

    it("returns 400 if no text could be extracted", async () => {
      mockPdfRawText = "   ";

      const res = await post(createMockRequest({ file: pdfFile(), publicKey: "pk_test" }));

      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe("Could not extract text from PDF");
    });
  });

  describe("embedding and saving", () => {
    it("saves every chunk and the training date in one transaction", async () => {
      mockPdfRawText = "Extracted PDF content text " + "A".repeat(800);

      const res = await post(createMockRequest({ file: pdfFile(), publicKey: "pk_test" }));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ status: "ok", chunks: 2 });
      expect(mockedCreateEmbedding).toHaveBeenCalledTimes(2);
      expect(mockTransaction).toHaveBeenCalledTimes(1);

      const [[sql, params]] = insertStatements();
      expect(sql).toBe(
        "INSERT INTO bot_documents (public_key, content, embedding) VALUES ($1, $2, $3::vector), ($4, $5, $6::vector)",
      );
      expect(params).toEqual(["pk_test", mockPdfRawText.slice(0, 800), "[0.1,0.2,0.3]", "pk_test", mockPdfRawText.slice(800), "[0.1,0.2,0.3]"]);
      expect(committed).toContainEqual(["UPDATE bots SET last_trained_at = NOW() WHERE public_key = $1", ["pk_test"]]);
    });

    it("inserts large PDFs in batches of 50 rows", async () => {
      mockPdfRawText = "x".repeat(800 * 120);

      await post(createMockRequest({ file: pdfFile(), publicKey: "pk_test" }));

      expect(insertStatements().map(([, params]) => (params as unknown[]).length / 3)).toEqual([50, 50, 20]);
    });

    it("sends at most 10 embedding requests to Gemini at a time", async () => {
      mockPdfRawText = "x".repeat(800 * 45);
      let inFlight = 0;
      let maxInFlight = 0;
      mockedCreateEmbedding.mockImplementation(async () => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 1));
        inFlight--;
        return [0.5];
      });

      const res = await post(createMockRequest({ file: pdfFile(), publicKey: "pk_test" }));

      expect(res.status).toBe(200);
      expect(mockedCreateEmbedding).toHaveBeenCalledTimes(45);
      expect(maxInFlight).toBe(10);
    });

    it("saves nothing and returns 502 when an embedding fails", async () => {
      mockPdfRawText = "x".repeat(800 * 15);
      mockedCreateEmbedding.mockImplementation(async (chunk: string) => {
        if (mockedCreateEmbedding.mock.calls.length === 12) throw new Error("Gemini 429");
        return [chunk.length];
      });

      const res = await post(createMockRequest({ file: pdfFile(), publicKey: "pk_test" }));

      expect(res.status).toBe(502);
      expect((await res.json()).error).toMatch(/Nothing was saved/);
      expect(mockTransaction).not.toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ tags: { area: "ingest_pdf" } }));
    });

    it("returns 500 and commits nothing when saving fails part-way", async () => {
      mockPdfRawText = "x".repeat(800 * 120);
      txQuery.mockImplementation(async () => {
        if (txQuery.mock.calls.length === 2) throw new Error("connection reset");
        return [];
      });

      const res = await post(createMockRequest({ file: pdfFile(), publicKey: "pk_test" }));

      expect(res.status).toBe(500);
      expect((await res.json()).error).toMatch(/Nothing was saved/);
      expect(committed).toEqual([]);
    });
  });
});
