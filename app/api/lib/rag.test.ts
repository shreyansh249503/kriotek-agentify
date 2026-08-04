import { retrieveWebsiteContext } from "./rag";
import { getDb } from "./db";
import { createEmbedding } from "./embeddings";

jest.mock("./db");
jest.mock("./embeddings");

describe("retrieveWebsiteContext", () => {
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockRepo),
    });
    (createEmbedding as jest.Mock).mockResolvedValue([0.1, 0.2, 0.3]);
  });

  it("should generate query embedding and return joined document contents", async () => {
    mockQueryBuilder.getMany.mockResolvedValueOnce([
      { content: "First relevant section." },
      { content: "Second relevant section." },
    ]);

    const result = await retrieveWebsiteContext("pk_123", "shipping policy");

    expect(createEmbedding).toHaveBeenCalledWith("shipping policy");
    expect(mockQueryBuilder.where).toHaveBeenCalledWith("doc.public_key = :publicKey", { publicKey: "pk_123" });
    expect(mockQueryBuilder.setParameter).toHaveBeenCalledWith("embedding", "[0.1,0.2,0.3]");
    expect(result).toBe("First relevant section.\nSecond relevant section.");
  });

  it("should filter out empty or missing content entries", async () => {
    mockQueryBuilder.getMany.mockResolvedValueOnce([
      { content: "Valid content" },
      { content: "" },
      { content: null },
    ]);

    const result = await retrieveWebsiteContext("pk_123", "returns");
    expect(result).toBe("Valid content");
  });

  it("should log error and rethrow when database query fails", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {});
    mockQueryBuilder.getMany.mockRejectedValueOnce(new Error("Vector DB connection error"));

    await expect(retrieveWebsiteContext("pk_123", "help")).rejects.toThrow("Vector DB connection error");
  });
});
