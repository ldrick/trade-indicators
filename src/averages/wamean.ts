import * as Arr from 'effect/Array';

/**
 * Weighted Arithmetic Mean.
 * @internal
 */
export const wamean = (values: Arr.NonEmptyReadonlyArray<number>): number => {
	const dividend = Arr.reduce(
		values,
		0,
		(reduced, value, index) => reduced + value * (index + 1),
	);
	const divisor = (values.length * (values.length + 1)) / 2;
	return dividend / divisor;
};
