---
title: macd.ts
nav_order: 3
parent: Modules
---

## macd.ts overview

---

## Exports Grouped by Category

- [indicators](#indicators)
  - [macd](#macd)
- [models](#models)
  - [MACDReturn (interface)](#macdreturn-interface)

---

# indicators

## macd

The Moving Average Convergence Divergence (MACD) is the relationship of
two Exponential Moving Averages (EMA) with different periods.
It generates crosses with the generated signal EMA which can be used
to indicate uptrends or downtrends. The histogram is MACD minus signal.

`slowPeriod` must be greater than `fastPeriod` (otherwise `PeriodSizeMismatchError`)
and at least `slowPeriod + signalPeriod - 1` values are required.
`macd` contains `values.length - slowPeriod + 1` values; `signal` and `histogram`
have the same length and are left-padded with `null` for the first `signalPeriod - 1` entries.

**Example**

```ts
import assert from "node:assert"
import { macd } from "@ldrick/trade-indicators/averages/macd.js"

const result = macd([1, 2, 4, 8, 16], 1, 2, 2)
assert.ok(result.ok)

const round = (values: readonly (null | number)[]) => values.map((v) => v?.toFixed(2) ?? null)
assert.deepStrictEqual(round(result.value.macd), ["0.50", "0.83", "1.61", "3.20"])
assert.deepStrictEqual(round(result.value.signal), [null, "0.67", "1.30", "2.57"])
assert.deepStrictEqual(round(result.value.histogram), [null, "0.17", "0.31", "0.64"])
```

**Signature**

```ts
declare const macd: (
  values: readonly number[],
  fastPeriod?: number,
  slowPeriod?: number,
  signalPeriod?: number
) => Result<MACDReturn>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/macd.ts#L74)

Since v0.3.0

# models

## MACDReturn (interface)

Result of `macd`. `signal` and `histogram` (`macd - signal`) are left-padded
with `null` to the length of `macd`.

**Signature**

```ts
export interface MACDReturn {
  histogram: NonEmptyArray<null | number>
  macd: NonEmptyArray<number>
  signal: NonEmptyArray<null | number>
}
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/macd.ts#L20)

Since v0.9.0
