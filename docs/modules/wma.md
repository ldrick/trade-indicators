---
title: wma.ts
nav_order: 10
parent: Modules
---

## Overview

The Weighted Moving Average (WMA) takes newer values weighted into account and reacts closer to the prices compared to the Simple Moving Average (SMA). It can be used to identify support and resistance levels. Also prices above the WMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { either as E } from 'fp-ts';

export declare const wma: (
  values: ReadonlyArray<number>,
  period?: number, // default: 20
) => E.Either<Error, ReadonlyArray<number>;
```

## Example

```typescript
import { either as E, function as F } from 'fp-ts';
import { wma } from '@ldrick/trade-indicators/averages/wma.js';

const result = F.pipe(
	wma([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3),
	E.fold(
		(error) => console.log(error),
		(values) => console.log(values),
	),
);
```
