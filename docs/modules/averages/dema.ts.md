---
title: dema.ts
nav_order: 1
parent: Modules
---

## dema.ts overview

---

## Exports Grouped by Category

- [incremental](#incremental)
  - [incrementalDema](#incrementaldema)
- [indicators](#indicators)
  - [dema](#dema)

---

# incremental

## incrementalDema

Incremental Double Exponential Moving Average (DEMA), see `dema`. `value` is `null` as long as `dema` returns `null` for that position.

**Example**

```ts
import assert from "node:assert"
import { incrementalDema } from "@ldrick/trade-indicators"

const created = incrementalDema(2)
assert.ok(created.ok)

let indicator = created.value
const outputs: (null | number)[] = []
for (const input of [1, 2, 3, 4, 5]) {
  const pushed = indicator.push(input)
  assert.ok(pushed.ok)
  indicator = pushed.value
  outputs.push(indicator.value)
}
assert.deepStrictEqual(outputs, [null, null, 3, 4, 5])
```

**Signature**

```ts
declare const incrementalDema: (period?: number) => Result<Incremental<number, null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/dema.ts#L90)

Since v0.9.0

# indicators

## dema

The Double Exponential Moving Average (DEMA) uses two Exponential Moving Average (EMA)
to reduce noise. It can be used to identify support and resistance levels.
Also prices above the DEMA can indicate uptrends, prices below can indicate downtrends.

Requires at least `2 * period - 1` values. Returns one value per input value; the first `2 * period - 2` are `null`.

**Example**

```ts
import assert from "node:assert"
import { dema } from "@ldrick/trade-indicators"

assert.deepStrictEqual(dema([1, 2, 3, 4, 5], 2), { ok: true, value: [null, null, 3, 4, 5] })
```

**Signature**

```ts
declare const dema: (values: readonly number[], period?: number) => Result<NonEmptyArray<null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/dema.ts#L52)

Since v0.1.1
