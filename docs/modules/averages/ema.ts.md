---
title: ema.ts
nav_order: 2
parent: Modules
---

## ema.ts overview

---

## Exports Grouped by Category

- [indicators](#indicators)
  - [ema](#ema)

---

# indicators

## ema

The Exponential Moving Average (EMA) takes newer values weighted into account
and reacts closer to the prices compared to the Simple Moving Average (SMA).
It can be used to identify support and resistance levels.
Also prices above the EMA can indicate uptrends, prices below can indicate downtrends.

Requires at least `period` values and returns `values.length - period + 1` values.
The first value is the SMA of the first `period` values.

**Example**

```ts
import assert from "node:assert"
import { ema } from "@ldrick/trade-indicators/averages/ema.js"

assert.deepStrictEqual(ema([1, 2, 3, 5, 9], 3), { ok: true, value: [2, 3.5, 6.25] })
```

**Signature**

```ts
declare const ema: (values: readonly number[], period?: number) => Result<NonEmptyArray<number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/ema.ts#L39)

Since v0.1.1
