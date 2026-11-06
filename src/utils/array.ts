import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { EmptyArrayError } from '../errors/EmptyArrayError.js';
import { NotEnoughDataError } from '../errors/NotEnoughDataError.js';
import * as number_ from './number.js';

/**
 * Map every element with its index to a `Result` and collect all successes,
 * failing with the first failure. Linear in the array length.
 * @internal
 */
export const traverseWithIndex =
	<A, B, E>(f: (index: number, a: A) => R.Result<B, E>) =>
	(values: Arr.NonEmptyReadonlyArray<A>): R.Result<Arr.NonEmptyReadonlyArray<B>, E> =>
		R.all(Arr.map(values, (value, index) => f(index, value)));

/**
 * Validates if every value of an Array is a finite Number.
 * @internal
 */
export const validateFinite = traverseWithIndex((_index, value: number) =>
	number_.validateFinite(value),
);

/**
 * Create new Array from given and fill left with value up to given size.
 * @internal
 */
export const fillLeftW =
	<A>(size: number, value: A) =>
	<B>(tail: Arr.NonEmptyReadonlyArray<B>): Arr.NonEmptyReadonlyArray<A | B> =>
		size > tail.length ? Arr.appendAll(Arr.replicate(value, size - tail.length), tail) : tail;

/**
 * Left-pad a series with `null` to the length of the input it was calculated from,
 * so that `result[i]` belongs to `values[i]`.
 * @internal
 */
export const alignTo =
	(length: number) =>
	<B>(series: Arr.NonEmptyReadonlyArray<B>): Arr.NonEmptyReadonlyArray<B | null> =>
		fillLeftW(length, null)(series);

/**
 * Get all but the first of an `NonEmptyReadonlyArray` as `NonEmptyReadonlyArray`
 * @internal
 */
export const tail = <A>(
	array: Arr.NonEmptyReadonlyArray<A>,
): R.Result<Arr.NonEmptyReadonlyArray<A>, Error> =>
	pipe(array, Arr.tailNonEmpty, (rest) =>
		Arr.isReadonlyArrayNonEmpty(rest) ? R.succeed(rest) : R.fail(new EmptyArrayError()),
	);

/**
 * Validates if an Array has the required size.
 * @internal
 */
export const validateRequiredSize =
	(required: number) =>
	<A>(array: readonly A[]): R.Result<Arr.NonEmptyReadonlyArray<A>, Error> =>
		Arr.isReadonlyArrayNonEmpty(array) && array.length >= required
			? R.succeed(array)
			: R.fail(new NotEnoughDataError(array.length, required));
