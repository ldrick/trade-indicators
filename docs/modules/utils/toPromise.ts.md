---
title: toPromise.ts
nav_order: 19
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
import { sma } from "@ldrick/trade-indicators/averages/sma.js"
import { toPromise } from "@ldrick/trade-indicators/toPromise.js"

assert.deepStrictEqual(await toPromise(sma([1, 2, 3], 2)), [1.5, 2.5])
await assert.rejects(toPromise(sma([1], 2)), { name: "NotEnoughDataError" })
```

**Signature**

```ts
declare const toPromise: <A, E extends Error>(result: Result<A, E>) => Promise<A>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/utils/toPromise.ts#L18)

Since v0.4.0
