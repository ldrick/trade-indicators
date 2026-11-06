import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as O from 'effect/Option';
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
	three: Arr.NonEmptyReadonlyArray<number>,
	period: number,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		three,
		array.traverseWithIndex((index, value) =>
			pipe(
				O.bindTo(Arr.get(one, index + 2 * (period - 1)), 'oneValue'),
				O.bind('twoValue', () => Arr.get(two, index + period - 1)),
				O.map(({ oneValue, twoValue }) => 3 * oneValue - 3 * twoValue + value),
				// v8 ignore next -- `one`, `two` and `three` are all derived from the same EMA chain, so their lengths are always in sync
				R.fromOption(() => new UnequalArraySizesError()),
			),
		),
	);

/**
 * The Triple Exponential Moving Average (TEMA) uses three Exponential Moving Average (EMA)
 * to reduce noise and still get close to latest prices.
 * It can be used to identify support and resistance levels.
 * Also prices above the TEMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `3 * period - 2` values. Returns one value per input value; the first `3 * period - 3` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { tema } from '@ldrick/trade-indicators';
 *
 * assert.deepStrictEqual(tema([1, 2, 3, 4, 5, 6], 2), { ok: true, value: [null, null, null, 4, 5, 6] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const tema = (
	values: readonly number[],
	period = 20,
): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(3 * period - 2)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.let('emaOne', ({ periodV, valuesF }) => emaC(valuesF, periodV)),
		R.let('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
		R.let('emaThree', ({ emaTwo, periodV }) => emaC(emaTwo, periodV)),
		R.flatMap(({ emaOne, emaThree, emaTwo, periodV }) =>
			calculate(emaOne, emaTwo, emaThree, periodV),
		),
		R.map(array.alignTo(values.length)),
		fromResult,
	);
