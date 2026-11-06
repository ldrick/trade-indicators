---
title: dema.ts
nav_order: 3
parent: Modules
---

## Overview

The Double Exponential Moving Average (DEMA) uses two Exponential Moving Average (EMA) to reduce noise. It can be used to identify support and resistance levels. Also prices above the DEMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { either as E, readonlyNonEmptyArray as RNEA } from 'fp-ts';

export declare const dema: (
	values: readonly number[],
	period?: number, // default: 20
) => E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>>;
```

## Output

Requires at least `2 * period - 1` values. Returns `values.length - 2 * period + 2` values; the first result belongs to the value at index `values.length - result.length`.

## Example

```typescript
import { either as E, function as F } from 'fp-ts';
import { dema } from '@ldrick/trade-indicators/averages/dema.js';

F.pipe(
	dema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3),
	E.fold(
		(error) => console.log(error),
		(values) => console.log(values),
	),
);
```
