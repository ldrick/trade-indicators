---
title: wma.ts
nav_order: 7
parent: Modules
---

## wma.ts overview

---

## Exports Grouped by Category

- [indicators](#indicators)
  - [wma](#wma)

---

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

[Source](https://github.com/ldrick/trade-indicators/blob/main/src/averages/wma.ts#L29)

Since v0.1.1
