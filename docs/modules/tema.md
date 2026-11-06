---
title: tema.ts
nav_order: 9
parent: Modules
---

## Overview

The Triple Exponential Moving Average (TEMA) uses three Exponential Moving Average (EMA) to reduce noise and still get close to latest prices. It can be used to identify support and resistance levels. Also prices above the TEMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { type NonEmptyArray, type Result } from '@ldrick/trade-indicators/types.js';

export declare const tema: (
	values: readonly number[],
	period?: number, // default: 20
) => Result<NonEmptyArray<number>>;
```

## Output

Requires at least `3 * period - 2` values. Returns `values.length - 3 * period + 3` values; the first result belongs to the value at index `values.length - result.length`.

## Example

```typescript
import { tema } from '@ldrick/trade-indicators/averages/tema.js';

const result = tema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3);

if (result.ok) {
	console.log(result.value);
} else {
	console.log(result.error);
}
```
