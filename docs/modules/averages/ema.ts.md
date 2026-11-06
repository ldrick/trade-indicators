---
title: ema.ts
nav_order: 2
parent: Modules
---

## ema.ts overview

---

## Exports Grouped by Category

- [incremental](#incremental)
  - [incrementalEma](#incrementalema)
- [indicators](#indicators)
  - [ema](#ema)

---

# incremental

## incrementalEma

Incremental Exponential Moving Average (EMA), see `ema`. `value` is `null` as long as `ema` returns `null` for that position.

**Example**

```ts
import assert from "node:assert"
import { incrementalEma } from "@ldrick/trade-indicators"

const created = incrementalEma(3)
assert.ok(created.ok)

let indicator = created.value
const outputs: (null | number)[] = []
for (const input of [1, 2, 3, 5, 9]) {
  const pushed = indicator.push(input)
  assert.ok(pushed.ok)
  indicator = pushed.value
  outputs.push(indicator.value)
}
assert.deepStrictEqual(outputs, [null, null, 2, 3.5, 6.25])
```

**Signature**

```ts
declare const incrementalEma: (period?: number) => Result<Incremental<number, null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/ema.ts#L73)

Since v0.9.0

# indicators

## ema

The Exponential Moving Average (EMA) takes newer values weighted into account
and reacts closer to the prices compared to the Simple Moving Average (SMA).
It can be used to identify support and resistance levels.
Also prices above the EMA can indicate uptrends, prices below can indicate downtrends.

Requires at least `period` values. Returns one value per input value; the first `period - 1` are `null`.
The first calculated value is the SMA of the first `period` values.

**Example**

```ts
import assert from "node:assert"
import { ema } from "@ldrick/trade-indicators"

assert.deepStrictEqual(ema([1, 2, 3, 5, 9], 3), { ok: true, value: [null, null, 2, 3.5, 6.25] })
```

**Signature**

```ts
declare const ema: (values: readonly number[], period?: number) => Result<NonEmptyArray<null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/ema.ts#L38)

Since v0.1.1
