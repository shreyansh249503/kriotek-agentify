import "./promise-polyfill";

describe("Promise.try polyfill", () => {
  const promiseWithTry = Promise as unknown as {
    try: <T>(fn: () => T | Promise<T>) => Promise<T>;
  };

  it("should attach Promise.try to the global Promise object if undefined", () => {
    expect(typeof promiseWithTry.try).toBe("function");
  });

  it("should resolve value returned by synchronous function passed to Promise.try", async () => {
    const result = await promiseWithTry.try(() => "sync-result");
    expect(result).toBe("sync-result");
  });

  it("should resolve value returned by async function passed to Promise.try", async () => {
    const result = await promiseWithTry.try(async () => "async-result");
    expect(result).toBe("async-result");
  });

  it("should reject when synchronous function throws an error inside Promise.try", async () => {
    await expect(
      promiseWithTry.try(() => {
        throw new Error("sync error");
      })
    ).rejects.toThrow("sync error");
  });

  it("should reject when async function rejects inside Promise.try", async () => {
    await expect(
      promiseWithTry.try(async () => {
        throw new Error("async error");
      })
    ).rejects.toThrow("async error");
  });
});
