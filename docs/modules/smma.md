---
title: smma.ts
nav_order: 8
parent: Modules
---

## Overview

The Smoothed Moving Average (SMMA) is like the Exponential Moving Average (EMA), with just a "smoother" factor. It can be used to identify support and resistance levels. Also prices above the SMMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';

export declare const smma: (
  values: readonly number[],
  period?: number, // default: 20
) => E.Either<Error, readonly Big[]>;
```

## Example

```typescript
import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { smma } from '@ldrick/trade-indicators';

const result = pipe(
  smma([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3),
  E.fold(
    (error) => console.log(error),
    (values) => console.log(values),
  ),
);
```
