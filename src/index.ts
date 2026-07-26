import { Semaphore, type Release } from "@lucid-softworks/semaphore";

export type { Release } from "@lucid-softworks/semaphore";

/** A fair, non-reentrant asynchronous mutex. */
export class Mutex {
  private readonly semaphore = new Semaphore(1);

  get locked(): boolean {
    return this.semaphore.available === 0;
  }

  get pending(): number {
    return this.semaphore.pending;
  }

  acquire(): Promise<Release> {
    return this.semaphore.acquire();
  }

  runExclusive<T>(task: () => T | PromiseLike<T>): Promise<T> {
    return this.semaphore.run(task);
  }
}
