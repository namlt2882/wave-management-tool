import { newSemaphore } from "./semaphore.js";

const { worker, exec } = newSemaphore(3);

export default exec;
