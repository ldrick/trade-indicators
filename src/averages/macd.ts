import { Big } from 'big.js';
import {
	apply as AP,
	either as E,
	function as F,
	readonlyArray as RA,
	readonlyNonEmptyArray as RNEA,
} from 'fp-ts';

import { PeriodSizeMissmatchError } from '../errors/PeriodSizeMissmatchError.js';
import { UnequalArraySizesError } from '../errors/UnequalArraySizesError.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { emaC } from './ema.js';

interface MACDReturn {
	macd: RNEA.ReadonlyNonEmptyArray<number>;
	signal: RNEA.ReadonlyNonEmptyArray<null | number>;
}

const validatePeriodSizes = (slowPeriod: number, fastPeriod: number): E.Either<Error, boolean> =>
	slowPeriod > fastPeriod
		? E.right(true)
		: E.left(new PeriodSizeMissmatchError('slowPeriod', 'fastPeriod'));

const calculate = (
	fast: RNEA.ReadonlyNonEmptyArray<Big>,
	slow: RNEA.ReadonlyNonEmptyArray<Big>,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
	F.pipe(
		slow,
		RNEA.traverseWithIndex(E.Applicative)((index, value) =>
			F.pipe(
				RA.lookup(fast.length - slow.length + index)(fast),
				// v8 ignore next -- `fast` is always at least as long as `slow`, guaranteed by validatePeriodSizes
				E.fromOption(() => new UnequalArraySizesError()),
				E.map((fastValue) => fastValue.sub(value)),
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
): E.Either<Error, MACDReturn> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			fastPeriodV: number_.validatePositiveInteger(fastPeriod),
			slowPeriodV: number_.validatePositiveInteger(slowPeriod),
			// eslint-disable-next-line perfectionist/sort-objects
			signalPeriodV: number_.validatePositiveInteger(signalPeriod),
			// eslint-disable-next-line perfectionist/sort-objects
			periodSizes: validatePeriodSizes(slowPeriod, fastPeriod),
			valuesV: array.validateRequiredSize(slowPeriod + signalPeriod - 1)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => array.toBig(valuesV)),
		E.bind('emaSlow', ({ slowPeriodV, valuesB }) => emaC(valuesB, slowPeriodV)),
		E.bind('emaFast', ({ fastPeriodV, valuesB }) => emaC(valuesB, fastPeriodV)),
		E.bind('macdResult', ({ emaFast, emaSlow }) => calculate(emaFast, emaSlow)),
		E.bind('signal', ({ macdResult, signalPeriodV }) => emaC(macdResult, signalPeriodV)),
		E.map(({ macdResult, signal }) => ({
			macd: array.toNumber(macdResult),
			signal: F.pipe(signal, array.toNumber, array.fillLeftW(macdResult.length, null)),
		})),
	);
