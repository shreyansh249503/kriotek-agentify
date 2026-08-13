import { POST } from "./route";
import { createEmbedding } from "../lib/embeddings";
import { getDb } from "../lib/db";

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
  createEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

jest.mock("../lib/db", () => ({
  getDb: jest.fn(),
}));

describe("POST /api/ingest-pdf", () => {
  const mockedGetDb = getDb as jest.Mock;
  const mockedCreateEmbedding = createEmbedding as jest.Mock;
  const mockCreate = jest.fn((doc) => doc);
  const mockSave = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    shouldFailPdfParse = false;
    mockPdfRawText = "Sample PDF extracted content text for testing.";

    mockedGetDb.mockResolvedValue({
      getRepository: () => ({
        create: mockCreate,
        save: mockSave,
      }),
    });
  });

  const createMockRequest = (fields: { file?: unknown; publicKey?: unknown }) => {
    const formData = {
      get: (key: string) => {
        if (key === "file") return fields.file ?? null;
        if (key === "publicKey") return fields.publicKey ?? null;
        return null;
      },
    };

    return {
      formData: jest.fn().mockResolvedValue(formData),
    } as unknown as Request;
  };

  const createMockFile = (content: string) => ({
    arrayBuffer: jest.fn().mockResolvedValue(Buffer.from(content).buffer),
  });

  it("should return 400 Bad Request if file or publicKey is missing", async () => {
    const req = createMockRequest({ publicKey: "pk_test" });
    const res = (await POST(req)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> };
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Missing file or publicKey");
  });

  it("should return 400 Bad Request if extracted text is empty", async () => {
    mockPdfRawText = "   ";
    const file = createMockFile("dummy pdf bytes");
    const req = createMockRequest({ file, publicKey: "pk_test" });

    const res = (await POST(req)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> };
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Could not extract text from PDF");
  });

  it("should reject with an error when PDF parsing fails", async () => {
    shouldFailPdfParse = true;
    const file = createMockFile("corrupt pdf bytes");
    const req = createMockRequest({ file, publicKey: "pk_test" });

    await expect(POST(req)).rejects.toThrow("Corrupt PDF file");
  });

  it("should successfully extract text, generate embeddings, and save document chunks", async () => {
    mockPdfRawText = "Extracted PDF content text " + "A".repeat(800);
    const file = createMockFile("valid pdf bytes");
    const req = createMockRequest({ file, publicKey: "pk_test" });

    const res = (await POST(req)) as unknown as { status: number; json: () => Promise<Record<string, unknown>> };
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.chunks).toBe(2);

    expect(mockedCreateEmbedding).toHaveBeenCalledTimes(2);
    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(mockSave).toHaveBeenCalledTimes(2);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        public_key: "pk_test",
        embedding: "[0.1,0.2,0.3]",
      })
    );
  });
});
