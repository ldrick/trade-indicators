import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import { fromResult } from '../utils/result.js';
import { ma } from './ma.js';
import { wamean } from './wamean.js';

/**
 * The Weighted Moving Average (WMA) takes newer values weighted into account
 * and reacts closer to the prices compared to the Simple Moving Average (SMA).
 * It can be used to identify support and resistance levels.
 * Also prices above the WMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `period` values. Returns one value per input value; the first `period - 1` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { wma } from '@ldrick/trade-indicators/averages/wma.js';
 *
 * // weights 1, 2, 3: (3 * 1 + 3 * 2 + 6 * 3) / 6 = 4.5
 * assert.deepStrictEqual(wma([3, 3, 6, 6], 3), { ok: true, value: [null, null, 4.5, 5.5] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const wma = (values: readonly number[], period = 20): Result<NonEmptyArray<null | number>> =>
	pipe(ma(values, period, wamean), R.map(array.alignTo(values.length)), fromResult);
