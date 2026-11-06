import { function as F, readonlyArray as RA, readonlyNonEmptyArray as RNEA } from 'fp-ts';

import { amean } from './amean.js';

/**
 * Base implementation for the Exponential Moving Average (EMA) and
 * the Smoothed Moving Average (SMMA) by providing a factor.
 * @internal
 */
export const dma = (
	values: RNEA.ReadonlyNonEmptyArray<number>,
	period: number,
	factor: number,
): RNEA.ReadonlyNonEmptyArray<number> => {
	const [init, rest] = RNEA.splitAt(period)(values);
	return F.pipe(
		rest,
		RA.scanLeft(amean(init), (previous, value) => (value - previous) * factor + previous),
	);
};
