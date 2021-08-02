---
title: atr.ts
nav_order: 2
parent: Modules
---

## Overview

The Average True Range (ATR) a period of the True Range Indicator, being the greatest out of current high minus the current low, the absolute value of current high minus previous close and the absolute value of the current low minus the prevous close.

## Signature

```typescript
import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';

export declare const atr: (
  values: {
    readonly high: readonly number[];
    readonly low: readonly number[];
    readonly close: readonly number[];
  },
  period?: number, // default: 14
) => E.Either<Error, readonly Big[]>;
```

## Example

```typescript
import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { atr } from '@ldrick/trade-indicators';

const result = pipe(
  atr(
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
