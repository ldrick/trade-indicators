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
 * Result of `macd`. `signal` and `histogram` (`macd - signal`) are left-padded
 * with `null` to the length of `macd`.
 * @public
 */
export interface MACDReturn {
	histogram: NonEmptyArray<null | number>;
	macd: NonEmptyArray<number>;
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
 * to indicate uptrends or downtrends.
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
		R.map(({ macdResult, signalPadded }) => ({
			histogram: Arr.zipWith(macdResult, signalPadded, (macdValue, signalValue) =>
				signalValue === null ? null : macdValue - signalValue,
			),
			macd: macdResult,
			signal: signalPadded,
		})),
		fromResult,
	);
