---
title: toEffectResult.ts
nav_order: 12
parent: Modules
---

## Overview

For use in [Effect](https://effect.website) pipelines, `toEffectResult` transforms a `Result` into an Effect `Result` (effect v4), which is `Success` or `Failure`.

## Signature

```typescript
import * as R from 'effect/Result';
import { type Result } from '@ldrick/trade-indicators/types.js';

export declare const toEffectResult: <A, E extends Error>(result: Result<A, E>) => R.Result<A, E>;
```

## Example

```typescript
import { pipe } from 'effect/Function';
import * as R from 'effect/Result';
import { ema } from '@ldrick/trade-indicators/averages/ema.js';
import { toEffectResult } from '@ldrick/trade-indicators/toEffectResult.js';

pipe(
	toEffectResult(ema([3, 2.1, 3, 4, 5.3, 5, 4.8, 6, 7, 5], 3)),
	R.map((values) => values.at(-1)),
	R.match({
		onFailure: (error) => console.log(error),
		onSuccess: (last) => console.log(last),
	}),
);
```
