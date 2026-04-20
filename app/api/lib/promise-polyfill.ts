if (typeof (Promise as any).try === "undefined") {
    (Promise as any).try = function <T>(fn: () => T | Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            try {
                resolve(fn());
            } catch (err) {
                reject(err);
            }
        });
    };
}