import { type NonEmptyArray, type Result } from '../types.js';
import { fromResult } from '../utils/result.js';
import { ma } from './ma.js';
import { wamean } from './wamean.js';

/**
 * The Weighted Moving Average (WMA) takes newer values weighted into account
 * and reacts closer to the prices compared to the Simple Moving Average (SMA).
 * It can be used to identify support and resistance levels.
 * Also prices above the WMA can indicate uptrends, prices below can indicate downtrends.
 * @public
 */
export const wma = (values: readonly number[], period = 20): Result<NonEmptyArray<number>> =>
	fromResult(ma(values, period, wamean));
