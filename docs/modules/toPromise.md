---
title: toPromise.ts
nav_order: 11
parent: Modules
---

## Overview

It might be easier to use `trade-indicators` within an existing project by handling errors with Promises. Therefore `toPromise` transforms each result of the other modules into a `Promise`, which rejects with the respective error.

## Signature

```typescript
import { either as E } from 'fp-ts';

export declare const toPromise: <A>(values: E.Either<Error, A>) => Promise<A>;
```

## Example

```typescript
import { ema } from '@ldrick/trade-indicators/averages/ema.js';
import { macd } from '@ldrick/trade-indicators/averages/macd.js';
import { toPromise } from '@ldrick/trade-indicators/toPromise.js';

toPromise(ema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3)).then(
	(result) => console.log(result),
	(error) => console.log(error),
);

toPromise(macd([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5, 3.5, 5.44, 8.1, 9.1, 11], 4, 5, 3)).then(
	(result) => console.log(result),
	(error) => console.log(error),
);
```
