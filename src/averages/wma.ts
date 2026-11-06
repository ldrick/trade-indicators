import { type NonEmptyArray, type Result } from '../types.js';
import { fromResult } from '../utils/result.js';
import { ma } from './ma.js';
import { wamean } from './wamean.js';

/**
 * The Weighted Moving Average (WMA) takes newer values weighted into account
 * and reacts closer to the prices compared to the Simple Moving Average (SMA).
 * It can be used to identify support and resistance levels.
 * Also prices above the WMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `period` values and returns `values.length - period + 1` values.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { wma } from '@ldrick/trade-indicators/averages/wma.js';
 *
 * // weights 1, 2, 3: (3 * 1 + 3 * 2 + 6 * 3) / 6 = 4.5
 * assert.deepStrictEqual(wma([3, 3, 6, 6], 3), { ok: true, value: [4.5, 5.5] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const wma = (values: readonly number[], period = 20): Result<NonEmptyArray<number>> =>
	fromResult(ma(values, period, wamean));
