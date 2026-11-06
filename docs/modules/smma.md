---
title: smma.ts
nav_order: 8
parent: Modules
---

## Overview

The Smoothed Moving Average (SMMA) is like the Exponential Moving Average (EMA), with just a "smoother" factor. It can be used to identify support and resistance levels. Also prices above the SMMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { either as E, readonlyNonEmptyArray as RNEA } from 'fp-ts';

export declare const smma: (
	values: readonly number[],
	period?: number, // default: 20
) => E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>>;
```

## Output

Requires at least `period` values. Returns `values.length - period + 1` values; the first result belongs to the value at index `values.length - result.length`.

## Example

```typescript
import { either as E, function as F } from 'fp-ts';
import { smma } from '@ldrick/trade-indicators/averages/smma.js';

F.pipe(
	smma([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3),
	E.fold(
		(error) => console.log(error),
		(values) => console.log(values),
	),
);
```
