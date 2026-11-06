import * as Arr from 'effect/Array';

import { amean } from './amean.js';

/**
 * Base implementation for the Exponential Moving Average (EMA) and
 * the Smoothed Moving Average (SMMA) by providing a factor.
 * @internal
 */
export const dma = (
	values: Arr.NonEmptyReadonlyArray<number>,
	period: number,
	factor: number,
): Arr.NonEmptyReadonlyArray<number> => {
	const [init, rest] = Arr.splitAtNonEmpty(values, period);
	return Arr.scan(rest, amean(init), (previous, value) => (value - previous) * factor + previous);
};
