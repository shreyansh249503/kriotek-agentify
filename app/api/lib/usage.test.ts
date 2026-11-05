import { UsageAccumulator } from "./usage";

describe("UsageAccumulator", () => {
  it("sums usage across calls", () => {
    const usage = new UsageAccumulator();

    usage.add({ inputTokens: 100, outputTokens: 20, totalTokens: 120 });
    usage.add({ inputTokens: 50, outputTokens: 5, totalTokens: 55 });

    expect(usage).toMatchObject({ inputTokens: 150, outputTokens: 25, totalTokens: 175 });
  });

  it("derives the total when the provider omits it", () => {
    const usage = new UsageAccumulator();

    expect(usage.add({ inputTokens: 10, outputTokens: 4 })).toBe(true);
    expect(usage.totalTokens).toBe(14);
  });

  it.each([undefined, null, {}, { inputTokens: undefined, outputTokens: undefined, totalTokens: undefined }])(
    "reports false and adds nothing for missing usage (%p)",
    (reported) => {
      const usage = new UsageAccumulator();

      expect(usage.add(reported)).toBe(false);
      expect(usage.totalTokens).toBe(0);
    },
  );
});
