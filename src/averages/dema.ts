import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { UnequalArraySizesError } from '../errors/UnequalArraySizesError.js';
import { type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromResult } from '../utils/result.js';
import { emaC } from './ema.js';

const calculate = (
	one: Arr.NonEmptyReadonlyArray<number>,
	two: Arr.NonEmptyReadonlyArray<number>,
	period: number,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		two,
		array.traverseWithIndex((index, value) =>
			pipe(
				Arr.get(one, index + period - 1),
				// v8 ignore next -- `one` and `two` are both derived from the same EMA chain, so their lengths are always in sync
				R.fromOption(() => new UnequalArraySizesError()),
				R.map((oneValue) => 2 * oneValue - value),
			),
		),
	);

/**
 * The Double Exponential Moving Average (DEMA) uses two Exponential Moving Average (EMA)
 * to reduce noise. It can be used to identify support and resistance levels.
 * Also prices above the DEMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `2 * period - 1` values. Returns one value per input value; the first `2 * period - 2` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { dema } from '@ldrick/trade-indicators/averages/dema.js';
 *
 * assert.deepStrictEqual(dema([1, 2, 3, 4, 5], 2), { ok: true, value: [null, null, 3, 4, 5] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const dema = (
	values: readonly number[],
	period = 20,
): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(2 * period - 1)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.let('emaOne', ({ periodV, valuesF }) => emaC(valuesF, periodV)),
		R.let('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
		R.flatMap(({ emaOne, emaTwo, periodV }) => calculate(emaOne, emaTwo, periodV)),
		R.map(array.alignTo(values.length)),
		fromResult,
	);
