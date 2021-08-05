---
title: tema.ts
nav_order: 9
parent: Modules
---

## Overview

The Triple Exponential Moving Average (TEMA) uses three Exponential Moving Average (EMA) to reduce noise and still get close to latest prices. It can be used to identify support and resistance levels. Also prices above the TEMA can indicate uptrends, prices below can indicate downtrends.

## Signature

```typescript
import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';

export declare const tema: (
  values: ReadonlyArray<number>,
  period?: number, // default: 20
) => E.Either<Error, ReadonlyArray<Big>;
```

## Example

```typescript
import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { tema } from '@ldrick/trade-indicators';

const result = pipe(
  tema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3),
  E.fold(
    (error) => console.log(error),
    (values) => console.log(values),
  ),
);
```
