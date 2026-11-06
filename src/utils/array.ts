import {
	either as E,
	function as F,
	readonlyArray as RA,
	readonlyNonEmptyArray as RNEA,
} from 'fp-ts';

import { EmptyArrayError } from '../errors/EmptyArrayError.js';
import { NotEnoughDataError } from '../errors/NotEnoughDataError.js';
import * as number_ from './number.js';

/**
 * Validates if every value of an Array is a finite Number.
 * @internal
 */
export const validateFinite = E.traverseReadonlyNonEmptyArrayWithIndex((_index, value: number) =>
	number_.validateFinite(value),
);

/**
 * Create new Array from given and fill left with value up to given size.
 * @internal
 */
export const fillLeftW =
	<A>(size: number, value: A) =>
	<B>(tail: RNEA.ReadonlyNonEmptyArray<B>): RNEA.ReadonlyNonEmptyArray<A | B> =>
		F.pipe(
			size > tail.length ? size - tail.length : 0,
			(times) => RA.replicate(times, value),
			RNEA.concatW(tail),
		);

/**
 * Get all but the first of an `ReadonlyNonEmptyArray` as `ReadonlyNonEmptyArray`
 * @internal
 */
export const tail = <A>(
	array: RNEA.ReadonlyNonEmptyArray<A>,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<A>> =>
	F.pipe(array, RNEA.tail, (rest) =>
		RA.isNonEmpty(rest) ? E.right(rest) : E.left(new EmptyArrayError()),
	);

/**
 * Validates if an Array has the required size.
 * @internal
 */
export const validateRequiredSize =
	(required: number) =>
	<A>(array: readonly A[]): E.Either<Error, RNEA.ReadonlyNonEmptyArray<A>> =>
		RA.isNonEmpty(array) && array.length >= required
			? E.right(array)
			: E.left(new NotEnoughDataError(array.length, required));
