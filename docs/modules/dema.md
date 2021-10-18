---
title: dema.ts
nav_order: 3
parent: Modules
---

## Overview

The Double Exponential Moving Average (DEMA) uses two Exponential Moving Average (EMA) to reduce noise. It can be used to identify support and resistance levels. Also prices above the DEMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { either as E } from 'fp-ts/lib';

export declare const dema: (
  values: ReadonlyArray<number>,
  period?: number, // default: 20
) => E.Either<Error, ReadonlyArray<number>>;
```

## Example

```typescript
import { either as E, function as F } from 'fp-ts/lib';
import { dema } from '@ldrick/trade-indicators';

const result = F.pipe(
  dema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3),
  E.fold(
    (error) => console.log(error),
    (values) => console.log(values),
  ),
);
```
