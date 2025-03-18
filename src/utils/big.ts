import { Big } from 'big.js';
import { function as F, ord as ORD, readonlyNonEmptyArray as RNEA } from 'fp-ts';

export const ord: ORD.Ord<Big> = {
	/**
	 * Big compare.
	 * @internal
	 */
	compare: (first, second) => (first.lt(second) ? -1 : first.gt(second) ? 1 : 0),
	/**
	 * Big equals.
	 * @internal
	 */
	equals: (first, second) => first.eq(second),
};

/**
 * Like `Math.max()` just for `Big`.
 * @internal
 */
export const max = (values: RNEA.ReadonlyNonEmptyArray<Big>): Big => F.pipe(values, RNEA.max(ord));

/**
 *  Chainable wrapper for Big.toNumber()
 * @internal
 */
export const toNumber = (b: Big): number => b.toNumber();
