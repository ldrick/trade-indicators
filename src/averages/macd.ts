import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { PeriodSizeMismatchError } from '../errors/PeriodSizeMismatchError.js';
import { UnequalArraySizesError } from '../errors/UnequalArraySizesError.js';
import { type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromResult } from '../utils/result.js';
import { emaC } from './ema.js';

/**
 * Result of `macd`. All three series have the length of the input values;
 * `histogram` is `macd - signal`.
 * @category models
 * @since 0.9.0
 * @public
 */
export interface MACDReturn {
	histogram: NonEmptyArray<null | number>;
	macd: NonEmptyArray<null | number>;
	signal: NonEmptyArray<null | number>;
}

const validatePeriodSizes = (slowPeriod: number, fastPeriod: number): R.Result<boolean, Error> =>
	slowPeriod > fastPeriod
		? R.succeed(true)
		: R.fail(new PeriodSizeMismatchError('slowPeriod', 'fastPeriod'));

const calculate = (
	fast: Arr.NonEmptyReadonlyArray<number>,
	slow: Arr.NonEmptyReadonlyArray<number>,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		slow,
		array.traverseWithIndex((index, value) =>
			pipe(
				Arr.get(fast, fast.length - slow.length + index),
				// v8 ignore next -- `fast` is always at least as long as `slow`, guaranteed by validatePeriodSizes
				R.fromOption(() => new UnequalArraySizesError()),
				R.map((fastValue) => fastValue - value),
			),
		),
	);

/**
 * The Moving Average Convergence Divergence (MACD) is the relationship of
 * two Exponential Moving Averages (EMA) with different periods.
 * It generates crosses with the generated signal EMA which can be used
 * to indicate uptrends or downtrends. The histogram is MACD minus signal.
 *
 * `slowPeriod` must be greater than `fastPeriod` (otherwise `PeriodSizeMismatchError`)
 * and at least `slowPeriod + signalPeriod - 1` values are required.
 * All three series have one value per input value: the first `slowPeriod - 1` values
 * of `macd` and the first `slowPeriod + signalPeriod - 2` values of `signal` and `histogram` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { macd } from '@ldrick/trade-indicators/averages/macd.js';
 *
 * const result = macd([1, 2, 4, 8, 16], 1, 2, 2);
 * assert.ok(result.ok);
 *
 * const round = (values: readonly (null | number)[]) => values.map((v) => v?.toFixed(2) ?? null);
 * assert.deepStrictEqual(round(result.value.macd), [null, '0.50', '0.83', '1.61', '3.20']);
 * assert.deepStrictEqual(round(result.value.signal), [null, null, '0.67', '1.30', '2.57']);
 * assert.deepStrictEqual(round(result.value.histogram), [null, null, '0.17', '0.31', '0.64']);
 * ```
 * @category indicators
 * @since 0.3.0
 * @public
 */
export const macd = (
	values: readonly number[],
	fastPeriod = 12,
	slowPeriod = 26,
	signalPeriod = 9,
): Result<MACDReturn> =>
	pipe(
		R.all({
			fastPeriodV: number_.validatePositiveInteger(fastPeriod),
			slowPeriodV: number_.validatePositiveInteger(slowPeriod),
			// eslint-disable-next-line perfectionist/sort-objects
			signalPeriodV: number_.validatePositiveInteger(signalPeriod),
			// eslint-disable-next-line perfectionist/sort-objects
			periodSizes: validatePeriodSizes(slowPeriod, fastPeriod),
			valuesV: array.validateRequiredSize(slowPeriod + signalPeriod - 1)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.let('emaSlow', ({ slowPeriodV, valuesF }) => emaC(valuesF, slowPeriodV)),
		R.let('emaFast', ({ fastPeriodV, valuesF }) => emaC(valuesF, fastPeriodV)),
		R.bind('macdResult', ({ emaFast, emaSlow }) => calculate(emaFast, emaSlow)),
		R.let('signal', ({ macdResult, signalPeriodV }) => emaC(macdResult, signalPeriodV)),
		R.let('signalPadded', ({ macdResult, signal }) =>
			pipe(signal, array.fillLeftW(macdResult.length, null)),
		),
		R.map(({ macdResult, signalPadded, valuesF }) => ({
			histogram: pipe(
				Arr.zipWith(macdResult, signalPadded, (macdValue, signalValue) =>
					signalValue === null ? null : macdValue - signalValue,
				),
				array.alignTo(valuesF.length),
			),
			macd: array.alignTo(valuesF.length)(macdResult),
			signal: array.alignTo(valuesF.length)(signalPadded),
		})),
		fromResult,
	);
