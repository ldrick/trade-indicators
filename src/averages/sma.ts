import { type NonEmptyArray, type Result } from '../types.js';
import { fromEither } from '../utils/result.js';
import { amean } from './amean.js';
import { ma } from './ma.js';

/**
 * The Simple Moving Average (SMA) calculates the arithmetic mean of prices over an period.
 * It can be used to identify support and resistance levels.
 * Also prices above the SMA can indicate uptrends, prices below can indicate downtrends.
 * @public
 */
export const sma = (values: readonly number[], period = 20): Result<NonEmptyArray<number>> =>
	fromEither(ma(values, period, amean));
