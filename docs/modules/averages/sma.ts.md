---
title: sma.ts
nav_order: 4
parent: Modules
---

## sma.ts overview

---

## Exports Grouped by Category

- [incremental](#incremental)
  - [incrementalSma](#incrementalsma)
- [indicators](#indicators)
  - [sma](#sma)

---

# incremental

## incrementalSma

Incremental Simple Moving Average (SMA), see `sma`. `value` is `null` as long as `sma` returns `null` for that position.

**Example**

```ts
import assert from "node:assert"
import { incrementalSma } from "@ldrick/trade-indicators"

const created = incrementalSma(3)
assert.ok(created.ok)

let indicator = created.value
const outputs: (null | number)[] = []
for (const input of [1, 2, 3, 4, 5]) {
  const pushed = indicator.push(input)
  assert.ok(pushed.ok)
  indicator = pushed.value
  outputs.push(indicator.value)
}
assert.deepStrictEqual(outputs, [null, null, 2, 3, 4])
```

**Signature**

```ts
declare const incrementalSma: (period?: number) => Result<Incremental<number, null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/sma.ts#L84)

Since v0.9.0

# indicators

## sma

The Simple Moving Average (SMA) calculates the arithmetic mean of prices over a period.
It can be used to identify support and resistance levels.
Also prices above the SMA can indicate uptrends, prices below can indicate downtrends.

Requires at least `period` values. Returns one value per input value; the first `period - 1` are `null`.

**Example**

```ts
import assert from "node:assert"
import { sma } from "@ldrick/trade-indicators"

assert.deepStrictEqual(sma([1, 2, 3, 4, 5], 3), { ok: true, value: [null, null, 2, 3, 4] })
```

**Signature**

```ts
declare const sma: (values: readonly number[], period?: number) => Result<NonEmptyArray<null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/sma.ts#L49)

Since v0.1.1
