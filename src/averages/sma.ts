import { type NonEmptyArray, type Result } from '../types.js';
import { fromResult } from '../utils/result.js';
import { amean } from './amean.js';
import { ma } from './ma.js';

/**
 * The Simple Moving Average (SMA) calculates the arithmetic mean of prices over a period.
 * It can be used to identify support and resistance levels.
 * Also prices above the SMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `period` values and returns `values.length - period + 1` values.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { sma } from '@ldrick/trade-indicators/averages/sma.js';
 *
 * assert.deepStrictEqual(sma([1, 2, 3, 4, 5], 3), { ok: true, value: [2, 3, 4] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const sma = (values: readonly number[], period = 20): Result<NonEmptyArray<number>> =>
	fromResult(ma(values, period, amean));
