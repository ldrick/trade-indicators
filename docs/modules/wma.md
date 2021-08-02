---
title: wma.ts
nav_order: 11
parent: Modules
---

## Overview

The Weighted Moving Average (WMA) takes newer values weighted into account and reacts closer to the prices compared to the Simple Moving Average (SMA). It can be used to identify support and resistance levels. Also prices above the WMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';

export declare const wma: (
  values: readonly number[],
  period?: number, // default: 20
) => E.Either<Error, readonly Big[]>;
```

## Example

```typescript
import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { wma } from '@ldrick/trade-indicators';

const result = pipe(
  wma([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3),
  E.fold(
    (error) => console.log(error),
    (values) => console.log(values),
  ),
);
```