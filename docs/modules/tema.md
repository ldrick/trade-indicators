---
title: tema.ts
nav_order: 9
parent: Modules
---

## Overview

The Triple Exponential Moving Average (TEMA) uses three Exponential Moving Average (EMA) to reduce noise and still get close to latest prices. It can be used to identify support and resistance levels. Also prices above the TEMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { either as E, readonlyNonEmptyArray as RNEA } from 'fp-ts';

export declare const tema: (
	values: readonly number[],
	period?: number, // default: 20
) => E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>>;
```

## Output

Requires at least `3 * period - 2` values. Returns `values.length - 3 * period + 3` values; the first result belongs to the value at index `values.length - result.length`.

## Example

```typescript
import { either as E, function as F } from 'fp-ts';
import { tema } from '@ldrick/trade-indicators/averages/tema.js';

F.pipe(
	tema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3),
	E.fold(
		(error) => console.log(error),
		(values) => console.log(values),
	),
);
```
