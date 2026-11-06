---
title: sma.ts
nav_order: 4
parent: Modules
---

## sma.ts overview

---

## Exports Grouped by Category

- [indicators](#indicators)
  - [sma](#sma)

---

# indicators

## sma

The Simple Moving Average (SMA) calculates the arithmetic mean of prices over a period.
It can be used to identify support and resistance levels.
Also prices above the SMA can indicate uptrends, prices below can indicate downtrends.

Requires at least `period` values and returns `values.length - period + 1` values.

**Example**

```ts
import assert from "node:assert"
import { sma } from "@ldrick/trade-indicators/averages/sma.js"

assert.deepStrictEqual(sma([1, 2, 3, 4, 5], 3), { ok: true, value: [2, 3, 4] })
```

**Signature**

```ts
declare const sma: (values: readonly number[], period?: number) => Result<NonEmptyArray<number>>
```

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/sma.ts#L23)

Since v0.1.1
