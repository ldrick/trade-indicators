import * as Arr from 'effect/Array';
import * as R from 'effect/Result';

import { NotEnoughDataError } from '../errors/NotEnoughDataError.js';
import { NotFiniteNumberError } from '../errors/NotFiniteNumberError.js';

/**
 * Validates if every value of an Array is a finite Number.
 * @internal
 */
export const validateFinite = (
	values: Arr.NonEmptyReadonlyArray<number>,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	values.every((value) => Number.isFinite(value))
		? R.succeed(values)
		: R.fail(new NotFiniteNumberError());

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
