import { type EmptyArrayError } from './errors/EmptyArrayError.js';
import { type NotEnoughDataError } from './errors/NotEnoughDataError.js';
import { type NotFiniteNumberError } from './errors/NotFiniteNumberError.js';
import { type NotPositiveIntegerError } from './errors/NotPositiveIntegerError.js';
import { type PeriodSizeMismatchError } from './errors/PeriodSizeMismatchError.js';
import { type UnequalArraySizesError } from './errors/UnequalArraySizesError.js';

/**
 * Price series of high, low and close values, all of the same length.
 * @public
 */
export interface HighLowClose<A> {
	readonly close: readonly A[];
	readonly high: readonly A[];
	readonly low: readonly A[];
}

/**
 * Any error an indicator can return.
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
 * Structurally identical to fp-ts' `ReadonlyNonEmptyArray`.
 * @public
 */
export type NonEmptyArray<A> = readonly A[] & { readonly 0: A };

/**
 * `HighLowClose` with non-empty arrays.
 * @internal
 */
export type NonEmptyHighLowClose<A> = {
	readonly [Property in keyof HighLowClose<A>]: NonEmptyArray<A>;
};

/**
 * Result of every indicator: either `{ ok: true, value }` or `{ ok: false, error }`.
 * Indicators never throw.
 * @public
 */
export type Result<A, E extends Error = IndicatorError> =
	| { readonly error: E; readonly ok: false }
	| { readonly ok: true; readonly value: A };
