import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { smmaC } from '../averages/smma.js';
import { type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromResult } from '../utils/result.js';

const changes = (
	values: Arr.NonEmptyReadonlyArray<number>,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		values,
		array.tail,
		R.map((rest) => Arr.zipWith(rest, values, (current, previous) => current - previous)),
	);

const calculate = (
	values: Arr.NonEmptyReadonlyArray<number>,
	period: number,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		R.bindTo(changes(values), 'deltas'),
		R.let('gains', ({ deltas }) =>
			smmaC(
				Arr.map(deltas, (delta) => Math.max(delta, 0)),
				period,
			),
		),
		R.let('losses', ({ deltas }) =>
			smmaC(
				Arr.map(deltas, (delta) => Math.max(-delta, 0)),
				period,
			),
		),
		R.map(({ gains, losses }) =>
			Arr.zipWith(gains, losses, (gain, loss) =>
				gain + loss === 0 ? 50 : (100 * gain) / (gain + loss),
			),
		),
	);

/**
 * The Relative Strength Index (RSI) by J. Welles Wilder is a momentum oscillator
 * between 0 and 100, comparing the smoothed average gains with the smoothed average losses.
 * Values above 70 are commonly seen as overbought, below 30 as oversold.
 * A series without any change yields the neutral value 50.
 *
 * Requires at least `period + 1` values. Returns one value per input value; the first `period` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { rsi } from '@ldrick/trade-indicators';
 *
 * const result = rsi([1, 2, 1, 3, 1], 2);
 * assert.ok(result.ok);
 * assert.deepStrictEqual(
 * 	result.value.map((v) => v?.toFixed(2) ?? null),
 * 	[null, null, '50.00', '83.33', '35.71'],
 * );
 * ```
 * @category indicators
 * @since 0.9.0
 * @public
 */
export const rsi = (values: readonly number[], period = 14): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period + 1)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.flatMap(({ periodV, valuesF }) => calculate(valuesF, periodV)),
		R.map(array.alignTo(values.length)),
		fromResult,
	);
