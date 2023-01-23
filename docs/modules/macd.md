---
title: macd.ts
nav_order: 5
parent: Modules
---

## Overview

The Moving Average Convergence Divergence (MACD) is the relationship of two Exponential Moving Averages (EMA) with different periods. It generates crosses with the generated signal EMA which can be used to indicate uptrends or downtrends.

## Signature

```typescript
import { either as E } from 'fp-ts/lib';

export declare const macd: (
  values: ReadonlyArray<number>,
  fastPeriod?: number, // default: 12
  slowPeriod?: number, // default: 26
  signalPeriod?: number, // default: 9
) => E.Either<Error, Readonly<Record<"macd" | "signal", ReadonlyArray<number | null>>>;
```

## Example

```typescript
import { either as E, function as F } from 'fp-ts/lib';
import { macd } from '@ldrick/trade-indicators/averages/macd.js';

const result = F.pipe(
	macd([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5, 3.5, 5.44, 8.1, 9.1, 11], 4, 5, 3),
	E.fold(
		(error) => console.log(error),
		(values) => console.log(values),
	),
);
```
