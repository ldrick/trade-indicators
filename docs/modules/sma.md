---
title: sma.ts
nav_order: 7
parent: Modules
---

## Overview

The Simple Moving Average (SMA) calculates the arithmetic mean of prices over a period. It can be used to identify support and resistance levels. Also prices above the SMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { type NonEmptyArray, type Result } from '@ldrick/trade-indicators/types.js';

export declare const sma: (
	values: readonly number[],
	period?: number, // default: 20
) => Result<NonEmptyArray<number>>;
```

## Output

Requires at least `period` values. Returns `values.length - period + 1` values; the first result belongs to the value at index `values.length - result.length`.

## Example

```typescript
import { sma } from '@ldrick/trade-indicators/averages/sma.js';

const result = sma([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3);

if (result.ok) {
	console.log(result.value);
} else {
	console.log(result.error);
}
```
