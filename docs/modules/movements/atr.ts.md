---
title: atr.ts
nav_order: 15
parent: Modules
---

## atr.ts overview

---

## Exports Grouped by Category

- [indicators](#indicators)
  - [atr](#atr)

---

# indicators

## atr

The Average True Range (ATR) is the smoothed average of the True Range,
being the greatest out of current high minus the current low,
the absolute value of current high minus previous close
and the absolute value of the current low minus the previous close.

`high`, `low` and `close` must have the same length (otherwise `UnequalArraySizesError`)
of at least `period + 1`. Returns one value per input value; the first `period` are `null`.

**Example**

```ts
import assert from "node:assert"
import { atr } from "@ldrick/trade-indicators/movements/atr.js"

const values = { close: [2, 3, 4, 5], high: [3, 4, 5, 6], low: [1, 2, 3, 4] }
assert.deepStrictEqual(atr(values, 2), { ok: true, value: [null, null, 2, 2] })
```

**Signature**

```ts
declare const atr: (values: HighLowClose<number>, period?: number) => Result<NonEmptyArray<null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/movements/atr.ts#L78)

Since v0.2.0
