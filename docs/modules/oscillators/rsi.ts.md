---
title: rsi.ts
nav_order: 16
parent: Modules
---

## rsi.ts overview

---

## Exports Grouped by Category

- [indicators](#indicators)
  - [rsi](#rsi)

---

# indicators

## rsi

The Relative Strength Index (RSI) by J. Welles Wilder is a momentum oscillator
between 0 and 100, comparing the smoothed average gains with the smoothed average losses.
Values above 70 are commonly seen as overbought, below 30 as oversold.
A series without any change yields the neutral value 50.

Requires at least `period + 1` values. Returns one value per input value; the first `period` are `null`.

**Example**

```ts
import assert from "node:assert"
import { rsi } from "@ldrick/trade-indicators"

const result = rsi([1, 2, 1, 3, 1], 2)
assert.ok(result.ok)
assert.deepStrictEqual(
  result.value.map((v) => v?.toFixed(2) ?? null),
  [null, null, "50.00", "83.33", "35.71"]
)
```

**Signature**

```ts
declare const rsi: (values: readonly number[], period?: number) => Result<NonEmptyArray<null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/oscillators/rsi.ts#L68)

Since v0.9.0
