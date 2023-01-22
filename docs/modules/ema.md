---
title: ema.ts
nav_order: 4
parent: Modules
---

## Overview

The Exponential Moving Average (EMA) takes newer values weighted into account and reacts closer to the prices compared to the Simple Moving Average (SMA). It can be used to identify support and resistance levels. Also prices above the EMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { either as E } from 'fp-ts/lib';

export declare const ema: (
	values: ReadonlyArray<number>,
	period?: number, // default: 20
) => E.Either<Error, ReadonlyArray<number>>;
```

## Example

```typescript
import { either as E, function as F } from 'fp-ts/lib';
import { ema } from '@ldrick/trade-indicators';

const result = F.pipe(
	ema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3),
	E.fold(
		(error) => console.log(error),
		(values) => console.log(values),
	),
);
```
