---
title: dma.ts
nav_order: 4
parent: Modules
---

## Overview

The Dynamic Moving Average (DMA) is the base implementation for the Exponential Moving Average (EMA) and the Smoothed Moving Average (SMMA) by providing a factor. It can be used to identify support and resistance levels. Also prices above the DMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';

export declare const dma: (
  values: ReadonlyArray<number>,
  period?: number, // default: 20
  factor?: number, // default: 2 / (period + 1)
) => E.Either<Error, ReadonlyArray<Big>>;
```

## Example

```typescript
import { either as E, function as F } from 'fp-ts/lib';
import { dma } from '@ldrick/trade-indicators';

const result = F.pipe(
  dma([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3, 2 / 3),
  E.fold(
    (error) => console.log(error),
    (values) => console.log(values),
  ),
);
```
