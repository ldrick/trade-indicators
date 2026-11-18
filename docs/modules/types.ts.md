---
title: types.ts
nav_order: 16
parent: Modules
---

## types.ts overview

---

## Exports Grouped by Category

- [models](#models)
  - [Candle (interface)](#candle-interface)
  - [HighLowClose (interface)](#highlowclose-interface)
  - [Incremental (interface)](#incremental-interface)
  - [IndicatorError (type alias)](#indicatorerror-type-alias)
  - [NonEmptyArray (type alias)](#nonemptyarray-type-alias)
  - [Result (type alias)](#result-type-alias)

---

# models

## Candle (interface)

One price candle with its high, low and close value.

**Signature**

```ts
export interface Candle {
  readonly close: number
  readonly high: number
  readonly low: number
}
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/types.ts#L13)

Since v0.9.0

## HighLowClose (interface)

Price series of high, low and close values, all of the same length.

**Signature**

```ts
export interface HighLowClose<A> {
  readonly close: readonly A[]
  readonly high: readonly A[]
  readonly low: readonly A[]
}
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/types.ts#L25)

Since v0.9.0

## Incremental (interface)

Indicator that is calculated value by value, e.g. for live prices.
`push` validates the input and returns a new instance whose `value` is the output for that input;
the instance it was called on never changes, so any instance can be kept and continued later.
Pushing the values of a series one by one yields exactly the values of the batch function.

**Example**

```ts
import assert from "node:assert"
import { incrementalSma } from "@ldrick/trade-indicators"

const created = incrementalSma(2)
assert.ok(created.ok)

const first = created.value.push(1)
assert.ok(first.ok)
assert.strictEqual(first.value.value, null)

const second = first.value.push(3)
assert.ok(second.ok)
assert.strictEqual(second.value.value, 2)
```

**Signature**

```ts
export interface Incremental<I, O> {
  readonly push: (input: I) => Result<Incremental<I, O>>
  readonly value: O
}
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/types.ts#L56)

Since v0.9.0

## IndicatorError (type alias)

Any error an indicator can return. Each one is a class from
`@ldrick/trade-indicators/errors/<Name>.js` and can be distinguished with `instanceof`:

- `NotPositiveIntegerError`: a period is not a positive safe integer.
- `NotEnoughDataError`: fewer values than the indicator needs for its period(s).
- `NotFiniteNumberError`: a value is `NaN`, `Infinity` or `-Infinity`.
- `UnequalArraySizesError`: `high`, `low` and `close` do not have the same length.
- `PeriodSizeMismatchError`: `macd`'s `slowPeriod` is not greater than its `fastPeriod`.

**Example**

```ts
import assert from "node:assert"
import { ema, NotEnoughDataError } from "@ldrick/trade-indicators"

const result = ema([1, 2], 3)
assert.ok(!result.ok && result.error instanceof NotEnoughDataError)
```

**Signature**

```ts
type IndicatorError =
  NotEnoughDataError | NotFiniteNumberError | NotPositiveIntegerError | PeriodSizeMismatchError | UnequalArraySizesError
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/types.ts#L82)

Since v0.9.0

## NonEmptyArray (type alias)

Readonly array with at least one element.

**Signature**

```ts
type NonEmptyArray<A> = readonly [A, ...A[]]
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/types.ts#L95)

Since v0.9.0

## Result (type alias)

Result of every indicator: either `{ ok: true, value }` or `{ ok: false, error }`.
Indicators never throw. Every series in `value` has one entry per input value
(`value[i]` belongs to `values[i]`); entries before the first calculable one are `null`.

**Example**

```ts
import { sma } from "@ldrick/trade-indicators"

const result = sma([1, 2, 3], 2)
if (result.ok) {
  console.log(result.value) // [null, 1.5, 2.5]
} else {
  console.error(result.error)
}
```

**Signature**

```ts
type Result<A, E extends Error = IndicatorError> =
  { readonly error: E; readonly ok: false } | { readonly ok: true; readonly value: A }
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/types.ts#L124)

Since v0.9.0
