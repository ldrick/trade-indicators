---
title: dema.ts
nav_order: 1
parent: Modules
---

## dema.ts overview

---

## Exports Grouped by Category

- [indicators](#indicators)
  - [dema](#dema)

---

# indicators

## dema

The Double Exponential Moving Average (DEMA) uses two Exponential Moving Average (EMA)
to reduce noise. It can be used to identify support and resistance levels.
Also prices above the DEMA can indicate uptrends, prices below can indicate downtrends.

Requires at least `2 * period - 1` values and returns `values.length - 2 * period + 2` values.

**Example**

```ts
import assert from "node:assert"
import { dema } from "@ldrick/trade-indicators/averages/dema.js"

assert.deepStrictEqual(dema([1, 2, 3, 4, 5], 2), { ok: true, value: [3, 4, 5] })
```

**Signature**

```ts
declare const dema: (values: readonly number[], period?: number) => Result<NonEmptyArray<number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/dema.ts#L46)

Since v0.1.1
