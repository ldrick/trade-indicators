---
title: smma.ts
nav_order: 5
parent: Modules
---

## smma.ts overview

---

## Exports Grouped by Category

- [indicators](#indicators)
  - [smma](#smma)

---

# indicators

## smma

The Smoothed Moving Average (SMMA) is like the Exponential Moving Average (EMA),
with just a “smoother” factor. It can be used to identify support and resistance levels.
Also prices above the SMMA can indicate uptrends, prices below can indicate downtrends.

Requires at least `period` values and returns `values.length - period + 1` values.

**Example**

```ts
import assert from "node:assert"
import { smma } from "@ldrick/trade-indicators/averages/smma.js"

assert.deepStrictEqual(smma([1, 2, 3, 4, 5], 2), { ok: true, value: [1.5, 2.25, 3.125, 4.0625] })
```

**Signature**

```ts
declare const smma: (values: readonly number[], period?: number) => Result<NonEmptyArray<number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/smma.ts#L37)

Since v0.1.1
