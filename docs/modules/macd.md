---
title: macd.ts
nav_order: 5
parent: Modules
---

## Overview

The Moving Average Convergence Divergence (MACD) is the relationship of two Exponential Moving Averages (EMA) with different periods. It generates crosses with the generated signal EMA which can be used to indicate uptrends or downtrends. The histogram is the difference of MACD and signal.

## Signature

```typescript
import { either as E, readonlyNonEmptyArray as RNEA } from 'fp-ts';

export interface MACDReturn {
	histogram: RNEA.ReadonlyNonEmptyArray<null | number>;
	macd: RNEA.ReadonlyNonEmptyArray<number>;
	signal: RNEA.ReadonlyNonEmptyArray<null | number>;
}

export declare const macd: (
	values: readonly number[],
	fastPeriod?: number, // default: 12
	slowPeriod?: number, // default: 26
	signalPeriod?: number, // default: 9
) => E.Either<Error, MACDReturn>;
```

## Output

`slowPeriod` must be greater than `fastPeriod` (otherwise `PeriodSizeMismatchError`) and at least `slowPeriod + signalPeriod - 1` values are required. `macd` contains `values.length - slowPeriod + 1` values; `signal` and `histogram` have the same length and are left-padded with `null` for the first `signalPeriod - 1` entries.

## Example

```typescript
import { either as E, function as F } from 'fp-ts';
import { macd } from '@ldrick/trade-indicators/averages/macd.js';

F.pipe(
	macd([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5, 3.5, 5.44, 8.1, 9.1, 11], 4, 5, 3),
	E.fold(
		(error) => console.log(error),
		(values) => console.log(values),
	),
);
```
