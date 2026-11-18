---
title: smma.ts
nav_order: 5
parent: Modules
---

## smma.ts overview

---

## Exports Grouped by Category

- [incremental](#incremental)
  - [incrementalSmma](#incrementalsmma)
- [indicators](#indicators)
  - [smma](#smma)

---

# incremental

## incrementalSmma

Incremental Smoothed Moving Average (SMMA), see `smma`. `value` is `null` as long as `smma` returns `null` for that position.

**Example**

```ts
import assert from "node:assert"
import { incrementalSmma } from "@ldrick/trade-indicators"

const created = incrementalSmma(2)
assert.ok(created.ok)

let indicator = created.value
const outputs: (null | number)[] = []
for (const input of [1, 2, 3, 4, 5]) {
  const pushed = indicator.push(input)
  assert.ok(pushed.ok)
  indicator = pushed.value
  outputs.push(indicator.value)
}
assert.deepStrictEqual(outputs, [null, 1.5, 2.25, 3.125, 4.0625])
```

**Signature**

```ts
declare const incrementalSmma: (period?: number) => Result<Incremental<number, null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/smma.ts#L74)

Since v0.9.0

# indicators

## smma

The Smoothed Moving Average (SMMA) is like the Exponential Moving Average (EMA),
with just a “smoother” factor. It can be used to identify support and resistance levels.
Also prices above the SMMA can indicate uptrends, prices below can indicate downtrends.

Requires at least `period` values. Returns one value per input value; the first `period - 1` are `null`.

**Example**

```ts
import assert from "node:assert"
import { smma } from "@ldrick/trade-indicators"

assert.deepStrictEqual(smma([1, 2, 3, 4, 5], 2), { ok: true, value: [null, 1.5, 2.25, 3.125, 4.0625] })
```

**Signature**

```ts
declare const smma: (values: readonly number[], period?: number) => Result<NonEmptyArray<null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/smma.ts#L36)

Since v0.1.1
