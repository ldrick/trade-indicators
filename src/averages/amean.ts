import { function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts';

/**
 * Arithmetic Mean.
 * @internal
 */
export const amean = (values: RNEA.ReadonlyNonEmptyArray<number>): number =>
	F.pipe(
		values,
		RNEA.reduce(0, (reduced, value) => reduced + value),
		(dividend) => dividend / values.length,
	);
