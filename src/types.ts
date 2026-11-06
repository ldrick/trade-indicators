import { type EmptyArrayError } from './errors/EmptyArrayError.js';
import { type NotEnoughDataError } from './errors/NotEnoughDataError.js';
import { type NotFiniteNumberError } from './errors/NotFiniteNumberError.js';
import { type NotPositiveIntegerError } from './errors/NotPositiveIntegerError.js';
import { type PeriodSizeMismatchError } from './errors/PeriodSizeMismatchError.js';
import { type UnequalArraySizesError } from './errors/UnequalArraySizesError.js';

/**
 * Price series of high, low and close values, all of the same length.
 * @category models
 * @since 0.9.0
 * @public
 */
export interface HighLowClose<A> {
	readonly close: readonly A[];
	readonly high: readonly A[];
	readonly low: readonly A[];
}

/**
 * Any error an indicator can return. Each one is a class from
 * `@ldrick/trade-indicators/errors/<Name>.js` and can be distinguished with `instanceof`:
 *
 * - `NotPositiveIntegerError`: a period is not a positive safe integer.
 * - `NotEnoughDataError`: fewer values than the indicator needs for its period(s).
 * - `NotFiniteNumberError`: a value is `NaN`, `Infinity` or `-Infinity`.
 * - `UnequalArraySizesError`: `high`, `low` and `close` do not have the same length.
 * - `PeriodSizeMismatchError`: `macd`'s `slowPeriod` is not greater than its `fastPeriod`.
 * - `EmptyArrayError`: an internal calculation step received an empty array.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { ema } from '@ldrick/trade-indicators/averages/ema.js';
 * import { NotEnoughDataError } from '@ldrick/trade-indicators/errors/NotEnoughDataError.js';
 *
 * const result = ema([1, 2], 3);
 * assert.ok(!result.ok && result.error instanceof NotEnoughDataError);
 * ```
 * @category models
 * @since 0.9.0
 * @public
 */
export type IndicatorError =
	| EmptyArrayError
	| NotEnoughDataError
	| NotFiniteNumberError
	| NotPositiveIntegerError
	| PeriodSizeMismatchError
	| UnequalArraySizesError;

/**
 * Readonly array with at least one element.
 * @category models
 * @since 0.9.0
 * @public
 */
export type NonEmptyArray<A> = readonly [A, ...A[]];

/**
 * `HighLowClose` with non-empty arrays.
 * @internal
 */
export type NonEmptyHighLowClose<A> = {
	readonly [Property in keyof HighLowClose<A>]: NonEmptyArray<A>;
};

/**
 * Result of every indicator: either `{ ok: true, value }` or `{ ok: false, error }`.
 * Indicators never throw. Every series in `value` has one entry per input value
 * (`value[i]` belongs to `values[i]`); entries before the first calculable one are `null`.
 * @example
 * ```ts
 * import { sma } from '@ldrick/trade-indicators/averages/sma.js';
 *
 * const result = sma([1, 2, 3], 2);
 * if (result.ok) {
 * 	console.log(result.value); // [null, 1.5, 2.5]
 * } else {
 * 	console.error(result.error);
 * }
 * ```
 * @category models
 * @since 0.9.0
 * @public
 */
export type Result<A, E extends Error = IndicatorError> =
	| { readonly error: E; readonly ok: false }
	| { readonly ok: true; readonly value: A };
