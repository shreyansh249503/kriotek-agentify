import { AxiosError, AxiosHeaders } from "axios";
import { getApiErrorMessage } from "./apiError";

function axiosError(status: number, data: unknown) {
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data,
  });
}

describe("getApiErrorMessage", () => {
  it("joins the API's error with its details", () => {
    const err = axiosError(400, { error: "Some bot settings are invalid", details: ["name: is required", "tone: Invalid option"] });

    expect(getApiErrorMessage(err)).toBe("Some bot settings are invalid: name: is required; tone: Invalid option");
  });

  it("uses the API's error alone when there are no details", () => {
    expect(getApiErrorMessage(axiosError(404, { error: "Bot not found" }))).toBe("Bot not found");
  });

  it("falls back for network errors, non-JSON responses and non-axios errors", () => {
    expect(getApiErrorMessage(axiosError(502, "<html>Bad gateway</html>"), "Could not save")).toBe("Could not save");
    expect(getApiErrorMessage(new Error("boom"), "Could not save")).toBe("Could not save");
    expect(getApiErrorMessage(undefined)).toBe("Something went wrong. Please try again.");
  });
});
