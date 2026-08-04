import { ingestDocument } from "./ingest";
import { getDb } from "./db";
import { createEmbedding } from "./embeddings";

jest.mock("./db");
jest.mock("./embeddings");

describe("ingestDocument", () => {
  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockRepo),
    });
    (createEmbedding as jest.Mock).mockResolvedValue([0.5, 0.6, 0.7]);
  });

  it("should create embedding and save document to repository", async () => {
    const mockCreatedDoc = { id: "doc_1", public_key: "pk_123", content: "Document body text", embedding: "[0.5,0.6,0.7]" };
    mockRepo.create.mockReturnValueOnce(mockCreatedDoc);

    await ingestDocument("pk_123", "Document body text");

    expect(createEmbedding).toHaveBeenCalledWith("Document body text");
    expect(mockRepo.create).toHaveBeenCalledWith({
      public_key: "pk_123",
      content: "Document body text",
      embedding: "[0.5,0.6,0.7]",
    });
    expect(mockRepo.save).toHaveBeenCalledWith(mockCreatedDoc);
  });
});
