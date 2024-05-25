import semaphore from "semaphore";

export const newSemaphore = (capacity = 1) => {
  const worker = semaphore(capacity);
  const exec = (fn = async () => {}) =>
    new Promise(async (resolve, reject) =>
      worker.take(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (e) {
          reject(e);
        } finally {
          worker.leave();
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
