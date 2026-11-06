---
title: toEither.ts
nav_order: 12
parent: Modules
---

## Overview

For use in [fp-ts](https://github.com/gcanti/fp-ts) pipelines, `toEither` transforms a `Result` into an `Either`. The returned type is structurally identical to fp-ts' `Either`, so `trade-indicators` does not depend on fp-ts.

## Signature

```typescript
import { type Result } from '@ldrick/trade-indicators/types.js';

export type Either<E, A> =
	| Readonly<{ _tag: 'Left'; left: E }>
	| Readonly<{ _tag: 'Right'; right: A }>;

export declare const toEither: <A, E extends Error>(result: Result<A, E>) => Either<E, A>;
```

## Example

```typescript
import { either as E, function as F } from 'fp-ts';
import { ema } from '@ldrick/trade-indicators/averages/ema.js';
import { toEither } from '@ldrick/trade-indicators/toEither.js';

F.pipe(
	toEither(ema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3)),
	E.map((values) => values.at(-1)),
	E.fold(
		(error) => console.log(error),
		(last) => console.log(last),
	),
);
```
