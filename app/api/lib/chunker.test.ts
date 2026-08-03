import { chunkText } from "./chunker";

describe("chunkText", () => {
  it("should return an empty array for empty or falsy text", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText(null as unknown as string)).toEqual([]);
    expect(chunkText(undefined as unknown as string)).toEqual([]);
  });

  it("should return an empty array if text length is less than 200 characters", () => {
    const shortText = "A".repeat(199);
    expect(chunkText(shortText)).toEqual([]);
  });

  it("should return a single chunk if text length is between 200 and default chunkSize (800)", () => {
    const text = "B".repeat(500);
    const result = chunkText(text);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(text);
  });

  it("should correctly split text longer than default chunkSize into multiple chunks", () => {
    const text = "C".repeat(1700);
    const result = chunkText(text);

    expect(result).toHaveLength(3);
    expect(result[0].length).toBe(800);
    expect(result[1].length).toBe(800);
    expect(result[2].length).toBe(100);
  });

  it("should handle exact multiples of chunkSize", () => {
    const text = "D".repeat(1600);
    const result = chunkText(text, 800);

    expect(result).toHaveLength(2);
    expect(result[0].length).toBe(800);
    expect(result[1].length).toBe(800);
  });

  it("should respect custom chunkSize parameter", () => {
    const text = "E".repeat(700);
    const result = chunkText(text, 300);

    expect(result).toHaveLength(3);
    expect(result[0].length).toBe(300);
    expect(result[1].length).toBe(300);
    expect(result[2].length).toBe(100);
  });
});
