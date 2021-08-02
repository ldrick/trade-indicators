---
title: macd.ts
nav_order: 6
parent: Modules
---

## Overview

The Moving Average Convergence Divergence (MACD) is the relationship of two Exponential Moving Averages (EMA) with different periods. It generates crosses with the generated signal EMA which can be used to indicate uptrends or downtrends.

## Signature

```typescript
import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';

export declare const macd: (
  values: readonly number[],
  fastPeriod?: number, // default: 12
  slowPeriod?: number, // default: 26
  signalPeriod?: number, // default: 9
) => E.Either<Error, { readonly macd: readonly Big[]; readonly signal: readonly Big[] }>;
```

## Example

```typescript
import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { macd } from '@ldrick/trade-indicators';

const result = pipe(
  macd([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5, 3.5, 5.44, 8.1, 9.1, 11], 4, 5, 3),
  E.fold(
    (error) => console.log(error),
    (values) => console.log(values),
  ),
);
```