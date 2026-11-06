import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromResult } from '../utils/result.js';
import { dma } from './dma.js';

/**
 * EMA without checks.
 * @internal
 */
export const emaC = (
	values: Arr.NonEmptyReadonlyArray<number>,
	period: number,
): Arr.NonEmptyReadonlyArray<number> => dma(values, period, 2 / (period + 1));

/**
 * The Exponential Moving Average (EMA) takes newer values weighted into account
 * and reacts closer to the prices compared to the Simple Moving Average (SMA).
 * It can be used to identify support and resistance levels.
 * Also prices above the EMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `period` values. Returns one value per input value; the first `period - 1` are `null`.
 * The first calculated value is the SMA of the first `period` values.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { ema } from '@ldrick/trade-indicators';
 *
 * assert.deepStrictEqual(ema([1, 2, 3, 5, 9], 3), { ok: true, value: [null, null, 2, 3.5, 6.25] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const ema = (values: readonly number[], period = 20): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.map(({ periodV, valuesF }) => array.alignTo(valuesF.length)(emaC(valuesF, periodV))),
		fromResult,
	);
