# `@lucid-softworks/mutex`

A fair, promise-based mutex for protecting asynchronous critical sections.

```ts
import { Mutex } from "@lucid-softworks/mutex";

const mutex = new Mutex();
let sharedValue = 0;

await mutex.runExclusive(async () => {
  sharedValue += 1;
});
```

Queued callers enter in FIFO order. The mutex is non-reentrant: attempting to
acquire it again before releasing it will wait like any other acquisition.

For custom cleanup, call `acquire()` and invoke the returned idempotent release
function in a `finally` block. The `locked` and `pending` getters expose current
state.
