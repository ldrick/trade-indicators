import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import { fromResult } from '../utils/result.js';
import { amean } from './amean.js';
import { ma } from './ma.js';

/**
 * The Simple Moving Average (SMA) calculates the arithmetic mean of prices over a period.
 * It can be used to identify support and resistance levels.
 * Also prices above the SMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `period` values. Returns one value per input value; the first `period - 1` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { sma } from '@ldrick/trade-indicators';
 *
 * assert.deepStrictEqual(sma([1, 2, 3, 4, 5], 3), { ok: true, value: [null, null, 2, 3, 4] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const sma = (values: readonly number[], period = 20): Result<NonEmptyArray<null | number>> =>
	pipe(ma(values, period, amean), R.map(array.alignTo(values.length)), fromResult);
