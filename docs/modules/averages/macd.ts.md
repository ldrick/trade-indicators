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
All three series have one value per input value: the first `slowPeriod - 1` values
of `macd` and the first `slowPeriod + signalPeriod - 2` values of `signal` and `histogram` are `null`.

**Example**

```ts
import assert from "node:assert"
import { macd } from "@ldrick/trade-indicators/averages/macd.js"

const result = macd([1, 2, 4, 8, 16], 1, 2, 2)
assert.ok(result.ok)

const round = (values: readonly (null | number)[]) => values.map((v) => v?.toFixed(2) ?? null)
assert.deepStrictEqual(round(result.value.macd), [null, "0.50", "0.83", "1.61", "3.20"])
assert.deepStrictEqual(round(result.value.signal), [null, null, "0.67", "1.30", "2.57"])
assert.deepStrictEqual(round(result.value.histogram), [null, null, "0.17", "0.31", "0.64"])
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

Result of `macd`. All three series have the length of the input values;
`histogram` is `macd - signal`.

**Signature**

```ts
export interface MACDReturn {
  histogram: NonEmptyArray<null | number>
  macd: NonEmptyArray<null | number>
  signal: NonEmptyArray<null | number>
}
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/macd.ts#L20)

Since v0.9.0
