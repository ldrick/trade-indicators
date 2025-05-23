import { either as E, readonlyNonEmptyArray as RNEA } from 'fp-ts';

import { ma } from './ma.js';
import { wamean } from './wamean.js';

/**
 * The Weighted Moving Average (WMA) takes newer values weighted into account
 * and reacts closer to the prices compared to the Simple Moving Average (SMA).
 * It can be used to identify support and resistance levels.
 * Also prices above the WMA can indicate uptrends, prices below can indicate downtrends.
 * @public
 */
export const wma = (
	values: readonly number[],
	period = 20,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> => ma(values, period, wamean);
