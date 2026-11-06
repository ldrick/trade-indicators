---
title: adx.ts
nav_order: 1
parent: Modules
---

## Overview

The Average Directional Index (ADX) determines trend strength. It also delivers Plus Directional Movement Indicator (PDI) and Minus Directional Movement Indicator (MDI). Crossings of these three values can be used to determine trend changes.

## Signature

```typescript
import {
	type HighLowClose,
	type NonEmptyArray,
	type Result,
} from '@ldrick/trade-indicators/types.js';

export interface ADXReturn {
	adx: NonEmptyArray<null | number>;
	mdi: NonEmptyArray<number>;
	pdi: NonEmptyArray<number>;
}

export declare const adx: (
	values: HighLowClose<number>,
	period?: number, // default: 14
) => Result<ADXReturn>;
```

## Output

`high`, `low` and `close` must have the same length (otherwise `UnequalArraySizesError`) of at least `2 * period`. `pdi` and `mdi` contain `values.length - period` values within 0 and 100; `adx` has the same length and is left-padded with `null` for the first `period - 1` entries.

## Example

```typescript
import { adx } from '@ldrick/trade-indicators/movements/adx.js';

const result = adx(
	{
		high: [3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5],
		low: [2, 1.1, 2, 3, 3.3, 2, 1.8, 4, 5.9, 4.1],
		close: [3, 1.5, 2.4, 3.9, 5.2, 5, 4.5, 6, 7, 4.6],
	},
	4,
);

if (result.ok) {
	console.log(result.value);
} else {
	console.log(result.error);
}
```
