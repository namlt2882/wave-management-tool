import { newSemaphore } from "./semaphore.js";

const { worker, exec } = newSemaphore(10);

export default exec;
