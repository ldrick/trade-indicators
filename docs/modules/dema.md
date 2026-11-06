---
title: dema.ts
nav_order: 3
parent: Modules
---

## Overview

The Double Exponential Moving Average (DEMA) uses two Exponential Moving Average (EMA) to reduce noise. It can be used to identify support and resistance levels. Also prices above the DEMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { type NonEmptyArray, type Result } from '@ldrick/trade-indicators/types.js';

export declare const dema: (
	values: readonly number[],
	period?: number, // default: 20
) => Result<NonEmptyArray<number>>;
```

## Output

Requires at least `2 * period - 1` values. Returns `values.length - 2 * period + 2` values; the first result belongs to the value at index `values.length - result.length`.

## Example

```typescript
import { dema } from '@ldrick/trade-indicators/averages/dema.js';

const result = dema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3);

if (result.ok) {
	console.log(result.value);
} else {
	console.log(result.error);
}
```
