---
title: sma.ts
nav_order: 7
parent: Modules
---

## Overview

The Simple Moving Average (SMA) calculates the arithmetic mean of prices over an period. It can be used to identify support and resistance levels. Also prices above the SMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';

export declare const sma: (
  values: readonly number[],
  period?: number, // default: 20
) => E.Either<Error, readonly Big[]>;
```

## Example

```typescript
import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { sma } from '@ldrick/trade-indicators';

const result = pipe(
  sma([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3),
  E.fold(
    (error) => console.log(error),
    (values) => console.log(values),
  ),
);
```
