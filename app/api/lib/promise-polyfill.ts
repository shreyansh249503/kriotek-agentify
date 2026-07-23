const promiseWithTry = Promise as unknown as {
  try?: <T>(fn: () => T | Promise<T>) => Promise<T>;
};

if (typeof promiseWithTry.try === "undefined") {
  promiseWithTry.try = function <T>(fn: () => T | Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    });
  };
}