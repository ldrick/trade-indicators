---
title: unwrap.ts
nav_order: 10
parent: Modules
---

## Overview

It might be easier to use `trade-indicators` within an existing project, by handling Errors with Promises. Therefor `unwrap` provides a way to transform each Result of the other Modules to respective `Promise<readonly number[]>` or `Promise<Record<string, readonly number[]>>`.

## Signature

```typescript
import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';

export function unwrap(values: E.Either<Error, readonly Big[]>): Promise<readonly number[]>;
export function unwrap(
  values: E.Either<Error, Record<string, readonly Big[]>>,
): Promise<Record<string, readonly number[]>>;
```

## Example

```typescript
import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { ema, macd, unwrap } from '@ldrick/trade-indicators';

const emaResult = ema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3);
unwrap(emaResult).then(
  (result) => console.log(result),
  (error) => console.log(error),
);

const macdResult = macd([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5, 3.5, 5.44, 8.1, 9.1, 11], 4, 5, 3);
unwrap(macdResult).then(
  (result) => console.log(result),
  (error) => console.log(error),
);
```
