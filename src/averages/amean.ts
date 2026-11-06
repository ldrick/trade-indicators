import * as Arr from 'effect/Array';

/**
 * Arithmetic Mean.
 * @internal
 */
export const amean = (values: Arr.NonEmptyReadonlyArray<number>): number =>
	Arr.reduce(values, 0, (reduced, value) => reduced + value) / values.length;
