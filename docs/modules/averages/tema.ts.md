---
title: tema.ts
nav_order: 6
parent: Modules
---

## tema.ts overview

---

## Exports Grouped by Category

- [indicators](#indicators)
  - [tema](#tema)

---

# indicators

## tema

The Triple Exponential Moving Average (TEMA) uses three Exponential Moving Average (EMA)
to reduce noise and still get close to latest prices.
It can be used to identify support and resistance levels.
Also prices above the TEMA can indicate uptrends, prices below can indicate downtrends.

Requires at least `3 * period - 2` values and returns `values.length - 3 * period + 3` values.

**Example**

```ts
import assert from "node:assert"
import { tema } from "@ldrick/trade-indicators/averages/tema.js"

assert.deepStrictEqual(tema([1, 2, 3, 4, 5, 6], 2), { ok: true, value: [4, 5, 6] })
```

**Signature**

```ts
declare const tema: (values: readonly number[], period?: number) => Result<NonEmptyArray<number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/tema.ts#L50)

Since v0.1.1
