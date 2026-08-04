import { getBotByPublicKey } from "./bot";
import { getDb } from "./db";

jest.mock("./db");

describe("getBotByPublicKey", () => {
  const mockRepo = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      getRepository: jest.fn().mockReturnValue(mockRepo),
    });
  });

  it("should return bot entity when public key exists in database", async () => {
    const mockBot = { id: "bot_1", public_key: "pk_valid_123", name: "Support Bot" };
    mockRepo.findOne.mockResolvedValueOnce(mockBot);

    const bot = await getBotByPublicKey("pk_valid_123");

    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: { public_key: "pk_valid_123" },
    });
    expect(bot).toEqual(mockBot);
  });

  it("should throw error 'Bot not found' when bot entity is missing", async () => {
    mockRepo.findOne.mockResolvedValueOnce(null);

    await expect(getBotByPublicKey("non_existent_key")).rejects.toThrow("Bot not found");
  });
});
