import { Big } from 'big.js';
import {
	apply as AP,
	either as E,
	function as F,
	readonlyArray as RA,
	readonlyNonEmptyArray as RNEA,
} from 'fp-ts/lib';
import { PeriodSizeMissmatchError } from '../errors';
import { ReadonlyRecordNonEmptyArray } from '../types';
import { arr, num } from '../utils';
import { emaC } from './ema';

type MACDReturn = ReadonlyRecordNonEmptyArray<number | null> & {
	readonly macd: RNEA.ReadonlyNonEmptyArray<number>;
	readonly signal: RNEA.ReadonlyNonEmptyArray<number | null>;
};

const validatePeriodSizes = (slowPeriod: number, fastPeriod: number): E.Either<Error, boolean> =>
	slowPeriod > fastPeriod
		? E.right(true)
		: E.left(new PeriodSizeMissmatchError('slowPeriod', 'fastPeriod'));

const calculate = (
	fast: RNEA.ReadonlyNonEmptyArray<Big>,
	slow: RNEA.ReadonlyNonEmptyArray<Big>,
): RNEA.ReadonlyNonEmptyArray<Big> =>
	F.pipe(
		slow,
		RNEA.mapWithIndex((index, value) => {
			const shortened = RA.takeRight(slow.length)(fast);
			return shortened[index].sub(value);
		}),
	);

/**
 * The Moving Average Convergence Divergence (MACD) is the relationship of
 * two Exponential Moving Averages (EMA) with different periods.
 * It generates crosses with the generated signal EMA which can be used
 * to indicate uptrends or downtrends.
 *
 * @public
 */
export const macd = (
	values: ReadonlyArray<number>,
	fastPeriod = 12,
	slowPeriod = 26,
	signalPeriod = 9,
): E.Either<Error, MACDReturn> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			fastPeriodV: num.validatePositiveInteger(fastPeriod),
			slowPeriodV: num.validatePositiveInteger(slowPeriod),
			signalPeriodV: num.validatePositiveInteger(signalPeriod),
			periodSizes: validatePeriodSizes(slowPeriod, fastPeriod),
			valuesV: arr.validateRequiredSize(slowPeriod + signalPeriod - 1)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => arr.toBig(valuesV)),
		E.bind('emaSlow', ({ valuesB, slowPeriodV }) => emaC(valuesB, slowPeriodV)),
		E.bind('emaFast', ({ valuesB, fastPeriodV }) => emaC(valuesB, fastPeriodV)),
		E.bind('macdResult', ({ emaFast, emaSlow }) => E.right(calculate(emaFast, emaSlow))),
		E.bind('signal', ({ macdResult, signalPeriodV }) => emaC(macdResult, signalPeriodV)),
		E.map(({ macdResult, signal }) => ({
			macd: arr.toNumber(macdResult),
			signal: F.pipe(signal, arr.toNumber, arr.fillLeftW(macdResult.length, null)),
		})),
	);
