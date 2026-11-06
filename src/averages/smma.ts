import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromResult } from '../utils/result.js';
import { dma } from './dma.js';

/**
 * SMMA without checks.
 * @internal
 */
export const smmaC = (
	values: Arr.NonEmptyReadonlyArray<number>,
	period: number,
): Arr.NonEmptyReadonlyArray<number> => dma(values, period, 1 / period);

/**
 * The Smoothed Moving Average (SMMA) is like the Exponential Moving Average (EMA),
 * with just a “smoother” factor. It can be used to identify support and resistance levels.
 * Also prices above the SMMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `period` values and returns `values.length - period + 1` values.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { smma } from '@ldrick/trade-indicators/averages/smma.js';
 *
 * assert.deepStrictEqual(smma([1, 2, 3, 4, 5], 2), { ok: true, value: [1.5, 2.25, 3.125, 4.0625] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const smma = (values: readonly number[], period = 20): Result<NonEmptyArray<number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.map(({ periodV, valuesF }) => smmaC(valuesF, periodV)),
		fromResult,
	);
