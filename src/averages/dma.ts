import { Big } from 'big.js';
import { function as F, readonlyArray as RA, readonlyNonEmptyArray as RNEA } from 'fp-ts';

import { amean } from './amean.js';

/**
 * Base implementation for the Exponential Moving Average (EMA) and
 * the Smoothed Moving Average (SMMA) by providing a factor.
 * @internal
 */
export const dma = (
	values: RNEA.ReadonlyNonEmptyArray<Big>,
	period: number,
	factor: Big,
): RNEA.ReadonlyNonEmptyArray<Big> => {
	const [init, rest] = RNEA.splitAt(period)(values);
	return F.pipe(
		rest,
		RA.reduce([amean(init)] as RNEA.ReadonlyNonEmptyArray<Big>, (reduced, value) => {
			const previous = RNEA.last(reduced);
			return RA.append(value.sub(previous).mul(factor).add(previous))(reduced);
		}),
	);
};
