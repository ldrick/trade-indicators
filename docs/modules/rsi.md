---
title: rsi.ts
nav_order: 6
parent: Modules
---

## Overview

The Relative Strength Index (RSI) by J. Welles Wilder is a momentum oscillator between 0 and 100, comparing the smoothed average gains with the smoothed average losses. Values above 70 are commonly seen as overbought, below 30 as oversold. A series without any change yields the neutral value 50.

## Signature

```typescript
import { type NonEmptyArray, type Result } from '@ldrick/trade-indicators/types.js';

export declare const rsi: (
	values: readonly number[],
	period?: number, // default: 14
) => Result<NonEmptyArray<number>>;
```

## Output

Requires at least `period + 1` values. Returns `values.length - period` values; the first result belongs to the value at index `period`.

## Example

```typescript
import { rsi } from '@ldrick/trade-indicators/oscillators/rsi.js';

const result = rsi([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3);

if (result.ok) {
	console.log(result.value);
} else {
	console.log(result.error);
}
```
