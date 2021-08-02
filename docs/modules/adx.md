---
title: adx.ts
nav_order: 1
parent: Modules
---

## Overview

The Average Directional Index (ADX) determines trend strength. It also delivers Plus Directional Movement Indicator (PDI) and Minus Directional Movement Indicator (MDI). Crossings of these three values can be used to determine trend changes.

## Signature

```typescript
import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';

export declare const adx: (
  values: {
    readonly high: readonly number[];
    readonly low: readonly number[];
    readonly close: readonly number[];
  },
  period?: number, // default: 14
) => E.Either<
  Error,
  {
    readonly adx: readonly Big[];
    readonly mdi: readonly Big[];
    readonly pdi: readonly Big[];
  }
>;
```

## Example

```typescript
import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { adx } from '@ldrick/trade-indicators';

const result = pipe(
  adx(
    {
      high: [3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5],
      low: [2, 1.1, 2, 3, 3.3, 2, 1.8, 4, 5.9, 4.1],
      close: [3, 1.5, 2.4, 3.9, 5.2, 5, 4.5, 6, 7, 4.6],
    },
    6,
  ),
  E.fold(
    (error) => console.log(error),
    (values) => console.log(values),
  ),
);
```
