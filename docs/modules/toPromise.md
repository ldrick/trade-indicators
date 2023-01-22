---
title: unwrap.ts
nav_order: 9
parent: Modules
---

## Overview

It might be easier to use `trade-indicators` within an existing project, by handling Errors with Promises. Therefor `toPromise` provides a way to transform each Result of the other Modules to respective `Promise<ReadonlyArray<number>>` or `Promise<Readonly<Record<string, ReadonlyArray<number>>>>`.

## Signature

```typescript
import { either as E } from 'fp-ts/lib';

export function toPromise<A>(values: E.Either<Error, A>): Promise<A>;
```

## Example

```typescript
import { ema, macd, toPromise } from '@ldrick/trade-indicators';

const emaResult = ema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3);
toPromise(emaResult).then(
	(result) => console.log(result),
	(error) => console.log(error),
);

const macdResult = macd([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5, 3.5, 5.44, 8.1, 9.1, 11], 4, 5, 3);
toPromise(macdResult).then(
	(result) => console.log(result),
	(error) => console.log(error),
);
```
