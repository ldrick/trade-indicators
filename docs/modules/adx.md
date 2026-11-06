---
title: adx.ts
nav_order: 1
parent: Modules
---

## Overview

The Average Directional Index (ADX) determines trend strength. It also delivers Plus Directional Movement Indicator (PDI) and Minus Directional Movement Indicator (MDI). Crossings of these three values can be used to determine trend changes.

## Signature

```typescript
import { either as E, readonlyNonEmptyArray as RNEA } from 'fp-ts';
import { type HighLowClose } from '@ldrick/trade-indicators/types.js';

export interface ADXReturn {
	adx: RNEA.ReadonlyNonEmptyArray<null | number>;
	mdi: RNEA.ReadonlyNonEmptyArray<number>;
	pdi: RNEA.ReadonlyNonEmptyArray<number>;
}

export declare const adx: (
	values: HighLowClose<number>,
	period?: number, // default: 14
) => E.Either<Error, ADXReturn>;
```

## Output

`high`, `low` and `close` must have the same length (otherwise `UnequalArraySizesError`) of at least `2 * period`. `pdi` and `mdi` contain `values.length - period` values within 0 and 100; `adx` has the same length and is left-padded with `null` for the first `period - 1` entries.

## Example

```typescript
import { either as E, function as F } from 'fp-ts';
import { adx } from '@ldrick/trade-indicators/movements/adx.js';

F.pipe(
	adx(
		{
			high: [3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5],
			low: [2, 1.1, 2, 3, 3.3, 2, 1.8, 4, 5.9, 4.1],
			close: [3, 1.5, 2.4, 3.9, 5.2, 5, 4.5, 6, 7, 4.6],
		},
		4,
	),
	E.fold(
		(error) => console.log(error),
		(values) => console.log(values),
	),
);
```
