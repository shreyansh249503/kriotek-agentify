import { createEmbedding } from "./embeddings";

describe("createEmbedding", () => {
  const originalApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "mock_test_key";
  });

  afterAll(() => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalApiKey;
  });

  it("should call Google Embeddings API and return vector array", async () => {
    const mockVector = [0.123, 0.456, 0.789];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        embedding: {
          values: mockVector,
        },
      }),
    });

    const result = await createEmbedding("sample text to embed");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=mock_test_key"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/gemini-embedding-001",
          content: {
            parts: [{ text: "sample text to embed" }],
          },
          outputDimensionality: 768,
        }),
      })
    );
    expect(result).toEqual(mockVector);
  });

  it("should throw error when Google API response is not ok", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { message: "Invalid API key" },
      }),
    });

    await expect(createEmbedding("test")).rejects.toThrow("Google Embedding API error: Invalid API key");
  });
});
