---
title: atr.ts
nav_order: 14
parent: Modules
---

## atr.ts overview

---

## Exports Grouped by Category

- [incremental](#incremental)
  - [incrementalAtr](#incrementalatr)
- [indicators](#indicators)
  - [atr](#atr)

---

# incremental

## incrementalAtr

Incremental Average True Range (ATR), see `atr`. Takes one candle per `push`.

**Example**

```ts
import assert from "node:assert"
import { incrementalAtr } from "@ldrick/trade-indicators"

const created = incrementalAtr(2)
assert.ok(created.ok)

let indicator = created.value
const outputs: (null | number)[] = []
for (const [high, low, close] of [
  [3, 1, 2],
  [4, 2, 3],
  [5, 3, 4],
  [6, 4, 5]
]) {
  const pushed = indicator.push({ close, high, low })
  assert.ok(pushed.ok)
  indicator = pushed.value
  outputs.push(indicator.value)
}
assert.deepStrictEqual(outputs, [null, null, 2, 2])
```

**Signature**

```ts
declare const incrementalAtr: (period?: number) => Result<Incremental<Candle, null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/movements/atr.ts#L115)

Since v0.9.0

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
import { atr } from "@ldrick/trade-indicators"

const values = { close: [2, 3, 4, 5], high: [3, 4, 5, 6], low: [1, 2, 3, 4] }
assert.deepStrictEqual(atr(values, 2), { ok: true, value: [null, null, 2, 2] })
```

**Signature**

```ts
declare const atr: (values: HighLowClose<number>, period?: number) => Result<NonEmptyArray<null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/movements/atr.ts#L76)

Since v0.2.0
