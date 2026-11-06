---
title: wma.ts
nav_order: 7
parent: Modules
---

## wma.ts overview

---

## Exports Grouped by Category

- [incremental](#incremental)
  - [incrementalWma](#incrementalwma)
- [indicators](#indicators)
  - [wma](#wma)

---

# incremental

## incrementalWma

Incremental Weighted Moving Average (WMA), see `wma`. `value` is `null` as long as `wma` returns `null` for that position.

**Example**

```ts
import assert from "node:assert"
import { incrementalWma } from "@ldrick/trade-indicators"

const created = incrementalWma(3)
assert.ok(created.ok)

let indicator = created.value
const outputs: (null | number)[] = []
for (const input of [3, 3, 6, 6]) {
  const pushed = indicator.push(input)
  assert.ok(pushed.ok)
  indicator = pushed.value
  outputs.push(indicator.value)
}
assert.deepStrictEqual(outputs, [null, null, 4.5, 5.5])
```

**Signature**

```ts
declare const incrementalWma: (period?: number) => Result<Incremental<number, null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/wma.ts#L95)

Since v0.9.0

# indicators

## wma

The Weighted Moving Average (WMA) takes newer values weighted into account
and reacts closer to the prices compared to the Simple Moving Average (SMA).
It can be used to identify support and resistance levels.
Also prices above the WMA can indicate uptrends, prices below can indicate downtrends.

Requires at least `period` values. Returns one value per input value; the first `period - 1` are `null`.

**Example**

```ts
import assert from "node:assert"
import { wma } from "@ldrick/trade-indicators"

// weights 1, 2, 3: (3 * 1 + 3 * 2 + 6 * 3) / 6 = 4.5
assert.deepStrictEqual(wma([3, 3, 6, 6], 3), { ok: true, value: [null, null, 4.5, 5.5] })
```

**Signature**

```ts
declare const wma: (values: readonly number[], period?: number) => Result<NonEmptyArray<null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/wma.ts#L60)

Since v0.1.1
