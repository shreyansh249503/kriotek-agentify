import { POST } from "./route";
import { setupCollection } from "../lib/vector-db-setup";

jest.mock("../lib/vector-db-setup");

describe("API: /api/setup-ingest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should execute setupCollection on POST request", async () => {
    (setupCollection as jest.Mock).mockResolvedValueOnce(undefined);

    const req = new Request("http://localhost/api/setup-ingest", {
      method: "POST",
    });

    await POST(req);

    expect(setupCollection).toHaveBeenCalledTimes(1);
  });
});
