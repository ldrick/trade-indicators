import { Big } from 'big.js';
import { function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts';

/**
 * Weighted Arithmetic Mean.
 *
 * @internal
 */
export const wamean = (values: RNEA.ReadonlyNonEmptyArray<Big>): Big => {
	const dividend = F.pipe(
		values,
		RNEA.reduceWithIndex(new Big(0), (index, reduced, value) => reduced.add(value.mul(index + 1))),
	);
	const divisor = F.pipe(
		values,
		RNEA.reduceWithIndex(new Big(0), (index, reduced) => reduced.add(index + 1)),
	);
	return dividend.div(divisor);
};
