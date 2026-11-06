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
of at least `2 * period`. `pdi` and `mdi` contain `values.length - period` values
within 0 and 100; `adx` has the same length and is left-padded with `null`
for the first `period - 1` entries.

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
assert.deepStrictEqual(round(result.value.pdi), ["40.00", "61.54", "32.00", "56.14"])
assert.deepStrictEqual(round(result.value.mdi), ["0.00", "0.00", "16.00", "7.02"])
assert.deepStrictEqual(round(result.value.adx), [null, "100.00", "66.67", "72.22"])
```

**Signature**

```ts
declare const adx: (values: HighLowClose<number>, period?: number) => Result<ADXReturn>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/movements/adx.ts#L142)

Since v0.2.0

# models

## ADXReturn (interface)

Result of `adx`. `adx` is left-padded with `null` to the length of `pdi` and `mdi`.

**Signature**

```ts
export interface ADXReturn {
  adx: NonEmptyArray<null | number>
  mdi: NonEmptyArray<number>
  pdi: NonEmptyArray<number>
}
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/movements/adx.ts#L26)

Since v0.9.0
