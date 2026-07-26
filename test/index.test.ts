import { describe, expect, it, vi } from "vitest";

import { Mutex } from "../src/index.js";

describe("Mutex", () => {
  it("exposes lock state and grants acquisitions in order", async () => {
    const mutex = new Mutex();
    const first = await mutex.acquire();
    const order: number[] = [];
    const secondPromise = mutex.acquire().then((release) => {
      order.push(2);
      return release;
    });

    expect(mutex.locked).toBe(true);
    expect(mutex.pending).toBe(1);

    first();
    const second = await secondPromise;
    expect(order).toEqual([2]);
    expect(mutex.pending).toBe(0);

    second();
    expect(mutex.locked).toBe(false);
  });

  it("runs one task at a time", async () => {
    const mutex = new Mutex();
    const finish: Array<() => void> = [];
    const order: string[] = [];
    const task = vi.fn<(name: string) => Promise<string>>(async (name) => {
      order.push(`start:${name}`);
      await new Promise<void>((resolve) => finish.push(resolve));
      order.push(`end:${name}`);
      return name;
    });

    const first = mutex.runExclusive(() => task("first"));
    const second = mutex.runExclusive(() => task("second"));
    await vi.waitFor(() => expect(task).toHaveBeenCalledTimes(1));
    finish.shift()?.();
    await vi.waitFor(() => expect(task).toHaveBeenCalledTimes(2));
    finish.shift()?.();

    await expect(Promise.all([first, second])).resolves.toEqual([
      "first",
      "second",
    ]);
    expect(order).toEqual([
      "start:first",
      "end:first",
      "start:second",
      "end:second",
    ]);
  });

  it("unlocks when an exclusive task fails", async () => {
    const mutex = new Mutex();

    await expect(
      mutex.runExclusive(() => {
        throw new Error("broken");
      }),
    ).rejects.toThrow("broken");
    expect(mutex.locked).toBe(false);
  });
});
