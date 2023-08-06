import { Big } from 'big.js';
import { function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts';

/**
 * Arithmetic Mean.
 * @internal
 */
export const amean = (values: RNEA.ReadonlyNonEmptyArray<Big>): Big =>
	F.pipe(
		values,
		RNEA.reduce(new Big(0), (reduced, value) => reduced.add(value)),
		(dividend) => dividend.div(values.length),
	);
