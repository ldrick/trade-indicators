---
title: errors
nav_order: 12
parent: Modules
---

## Overview

No function of `trade-indicators` throws. Invalid input is returned as `E.left` with an instance of one of these error classes, so it can be distinguished with `instanceof`.

| Error                     | Import path                                                  | Returned when                                                       |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| `EmptyArrayError`         | `@ldrick/trade-indicators/errors/EmptyArrayError.js`         | An internal calculation step received an empty array.               |
| `NotEnoughDataError`      | `@ldrick/trade-indicators/errors/NotEnoughDataError.js`      | Fewer values were given than the indicator needs for its period(s). |
| `NotFiniteNumberError`    | `@ldrick/trade-indicators/errors/NotFiniteNumberError.js`    | A value is `NaN`, `Infinity` or `-Infinity`.                        |
| `NotPositiveIntegerError` | `@ldrick/trade-indicators/errors/NotPositiveIntegerError.js` | A period is not a positive safe integer.                            |
| `PeriodSizeMismatchError` | `@ldrick/trade-indicators/errors/PeriodSizeMismatchError.js` | `macd`'s `slowPeriod` is not greater than its `fastPeriod`.         |
| `UnequalArraySizesError`  | `@ldrick/trade-indicators/errors/UnequalArraySizesError.js`  | `high`, `low` and `close` do not have the same length.              |

## Example

```typescript
import { either as E, function as F } from 'fp-ts';
import { ema } from '@ldrick/trade-indicators/averages/ema.js';
import { NotEnoughDataError } from '@ldrick/trade-indicators/errors/NotEnoughDataError.js';

F.pipe(
	ema([1, 2], 3),
	E.fold(
		(error) => console.log(error instanceof NotEnoughDataError ? 'need more data' : error),
		(values) => console.log(values),
	),
);
```
