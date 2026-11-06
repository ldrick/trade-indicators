---
title: atr.ts
nav_order: 2
parent: Modules
---

## Overview

The Average True Range (ATR) is the smoothed average of the True Range, being the greatest out of current high minus the current low, the absolute value of current high minus previous close and the absolute value of the current low minus the previous close.

## Signature

```typescript
import { either as E, readonlyNonEmptyArray as RNEA } from 'fp-ts';
import { type HighLowClose } from '@ldrick/trade-indicators/types.js';

export declare const atr: (
	values: HighLowClose<number>,
	period?: number, // default: 14
) => E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>>;
```

## Output

`high`, `low` and `close` must have the same length (otherwise `UnequalArraySizesError`) of at least `period + 1`. Returns `values.length - period` values.

## Example

```typescript
import { either as E, function as F } from 'fp-ts';
import { atr } from '@ldrick/trade-indicators/movements/atr.js';

F.pipe(
	atr(
		{
			high: [3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5],
			low: [2, 1.1, 2, 3, 3.3, 2, 1.8, 4, 5.9, 4.1],
			close: [3, 1.5, 2.4, 3.9, 5.2, 5, 4.5, 6, 7, 4.6],
		},
		6,
	),
	E.fold(
		(error) => console.log(error),
		(values) => console.log(values),
	),
);
```
