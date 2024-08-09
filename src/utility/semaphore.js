import semaphore from "semaphore";

export const newSemaphore = (capacity = 1) => {
  const worker = semaphore(capacity);
  const exec = (fn = async () => {}, count = 1) =>
    new Promise(async (resolve, reject) =>
      worker.take(count, async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (e) {
          reject(e);
        } finally {
          worker.leave(count);
        }
      })
    );
  const execAndNotLeave = (fn = async () => {}) =>
    new Promise(async (resolve, reject) =>
      worker.take(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (e) {
          reject(e);
        }
      })
    );
  return { worker, exec, execAndNotLeave };
};
