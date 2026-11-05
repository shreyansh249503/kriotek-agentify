import { DEFAULT_GEMINI_MODEL, getModelName } from "./model";

describe("getModelName", () => {
  it("uses GEMINI_MODEL when set", () => {
    expect(getModelName({ GEMINI_MODEL: "gemini-2.5-pro" } as unknown as NodeJS.ProcessEnv)).toBe("gemini-2.5-pro");
  });

  it("falls back to the default model", () => {
    expect(getModelName({} as NodeJS.ProcessEnv)).toBe(DEFAULT_GEMINI_MODEL);
  });
});
