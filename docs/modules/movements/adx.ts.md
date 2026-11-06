---
title: adx.ts
nav_order: 14
parent: Modules
---

## adx.ts overview

---

## Exports Grouped by Category

- [indicators](#indicators)
  - [adx](#adx)
- [models](#models)
  - [ADXReturn (interface)](#adxreturn-interface)

---

# indicators

## adx

The Average Directional Index (ADX) determines trend strength.
It also delivers Plus Directional Movement Indicator (PDI)
and Minus Directional Movement Indicator (MDI).
Crossings of these three values can be used to determine trend changes.

`high`, `low` and `close` must have the same length (otherwise `UnequalArraySizesError`)
of at least `2 * period`. All three series have one value per input value within 0 and 100:
the first `period` values of `pdi` and `mdi` and the first `2 * period - 1` values of `adx` are `null`.

**Example**

```ts
import assert from "node:assert"
import { adx } from "@ldrick/trade-indicators/movements/adx.js"

const result = adx(
  {
    close: [9, 11, 10, 13, 12, 15],
    high: [10, 12, 11, 14, 13, 16],
    low: [8, 9, 9, 11, 10, 13]
  },
  2
)
assert.ok(result.ok)

const round = (values: readonly (null | number)[]) => values.map((v) => v?.toFixed(2) ?? null)
assert.deepStrictEqual(round(result.value.pdi), [null, null, "40.00", "61.54", "32.00", "56.14"])
assert.deepStrictEqual(round(result.value.mdi), [null, null, "0.00", "0.00", "16.00", "7.02"])
assert.deepStrictEqual(round(result.value.adx), [null, null, null, "100.00", "66.67", "72.22"])
```

**Signature**

```ts
declare const adx: (values: HighLowClose<number>, period?: number) => Result<ADXReturn>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/movements/adx.ts#L141)

Since v0.2.0

# models

## ADXReturn (interface)

Result of `adx`. All three series have the length of the input values.

**Signature**

```ts
export interface ADXReturn {
  adx: NonEmptyArray<null | number>
  mdi: NonEmptyArray<null | number>
  pdi: NonEmptyArray<null | number>
}
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/movements/adx.ts#L26)

Since v0.9.0
