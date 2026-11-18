---
title: toPromise.ts
nav_order: 18
parent: Modules
---

## toPromise.ts overview

---

## Exports Grouped by Category

- [adapters](#adapters)
  - [toPromise](#topromise)

---

# adapters

## toPromise

Transform a `Result` into a `Promise`, which rejects with the error.

**Example**

```ts
import assert from "node:assert"
import { sma, toPromise } from "@ldrick/trade-indicators"

assert.deepStrictEqual(await toPromise(sma([1, 2, 3], 2)), [null, 1.5, 2.5])
await assert.rejects(toPromise(sma([1], 2)), { name: "NotEnoughDataError" })
```

**Signature**

```ts
declare const toPromise: <A, E extends Error>(result: Result<A, E>) => Promise<A>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/utils/toPromise.ts#L17)

Since v0.4.0
