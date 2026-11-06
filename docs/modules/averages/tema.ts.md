---
title: tema.ts
nav_order: 6
parent: Modules
---

## tema.ts overview

---

## Exports Grouped by Category

- [incremental](#incremental)
  - [incrementalTema](#incrementaltema)
- [indicators](#indicators)
  - [tema](#tema)

---

# incremental

## incrementalTema

Incremental Triple Exponential Moving Average (TEMA), see `tema`. `value` is `null` as long as `tema` returns `null` for that position.

**Example**

```ts
import assert from "node:assert"
import { incrementalTema } from "@ldrick/trade-indicators"

const created = incrementalTema(2)
assert.ok(created.ok)

let indicator = created.value
const outputs: (null | number)[] = []
for (const input of [1, 2, 3, 4, 5, 6]) {
  const pushed = indicator.push(input)
  assert.ok(pushed.ok)
  indicator = pushed.value
  outputs.push(indicator.value)
}
assert.deepStrictEqual(outputs, [null, null, null, 4, 5, 6])
```

**Signature**

```ts
declare const incrementalTema: (period?: number) => Result<Incremental<number, null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/tema.ts#L98)

Since v0.9.0

# indicators

## tema

The Triple Exponential Moving Average (TEMA) uses three Exponential Moving Average (EMA)
to reduce noise and still get close to latest prices.
It can be used to identify support and resistance levels.
Also prices above the TEMA can indicate uptrends, prices below can indicate downtrends.

Requires at least `3 * period - 2` values. Returns one value per input value; the first `3 * period - 3` are `null`.

**Example**

```ts
import assert from "node:assert"
import { tema } from "@ldrick/trade-indicators"

assert.deepStrictEqual(tema([1, 2, 3, 4, 5, 6], 2), { ok: true, value: [null, null, null, 4, 5, 6] })
```

**Signature**

```ts
declare const tema: (values: readonly number[], period?: number) => Result<NonEmptyArray<null | number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/tema.ts#L60)

Since v0.1.1
