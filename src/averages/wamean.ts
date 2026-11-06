import { function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts';

/**
 * Weighted Arithmetic Mean.
 * @internal
 */
export const wamean = (values: RNEA.ReadonlyNonEmptyArray<number>): number => {
	const dividend = F.pipe(
		values,
		RNEA.reduceWithIndex(0, (index, reduced, value) => reduced + value * (index + 1)),
	);
	const divisor = (values.length * (values.length + 1)) / 2;
	return dividend / divisor;
};
