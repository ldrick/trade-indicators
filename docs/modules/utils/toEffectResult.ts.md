---
title: toEffectResult.ts
nav_order: 18
parent: Modules
---

## toEffectResult.ts overview

---

## Exports Grouped by Category

- [adapters](#adapters)
  - [toEffectResult](#toeffectresult)

---

# adapters

## toEffectResult

Transform a `Result` into an Effect `Result` (effect v4) for use in Effect pipelines.

**Example**

```ts
import assert from "node:assert"
import { pipe } from "effect/Function"
import * as R from "effect/Result"
import { sma } from "@ldrick/trade-indicators/averages/sma.js"
import { toEffectResult } from "@ldrick/trade-indicators/toEffectResult.js"

const last = pipe(
  toEffectResult(sma([1, 2, 3, 4], 2)),
  R.map((values) => values.at(-1))
)
assert.deepStrictEqual(last, R.succeed(3.5))
```

**Signature**

```ts
declare const toEffectResult: <A, E extends Error>(result: Result<A, E>) => R.Result<A, E>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/utils/toEffectResult.ts#L25)

Since v0.9.0
