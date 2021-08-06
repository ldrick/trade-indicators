import { Big } from 'big.js';
import {
  apply as AP,
  either as E,
  function as F,
  readonlyNonEmptyArray as RNEA,
  readonlyRecord as RR,
} from 'fp-ts/lib';
import { PeriodSizeMissmatchError } from '../errors';
import { arrayToBig, trimLeft } from '../utils';
import { validatePeriod, validateValues } from '../validations';
import { emaC } from './ema';

const validatePeriodSizes = (slowPeriod: number, fastPeriod: number): E.Either<Error, boolean> =>
  slowPeriod > fastPeriod
    ? E.right(true)
    : E.left(new PeriodSizeMissmatchError('slowPeriod', 'fastPeriod'));

const calculate = (
  fast: RNEA.ReadonlyNonEmptyArray<Big>,
  slow: RNEA.ReadonlyNonEmptyArray<Big>,
): RNEA.ReadonlyNonEmptyArray<Big> => {
  const shortened = fast.slice(-1 * slow.length);
  return F.pipe(
    slow,
    RNEA.mapWithIndex((index, value) => shortened[index].sub(value)),
  );
};

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
): E.Either<Error, RR.ReadonlyRecord<'macd' | 'signal', RNEA.ReadonlyNonEmptyArray<Big>>> =>
  F.pipe(
    AP.sequenceS(E.Apply)({
      fastPeriodV: validatePeriod(fastPeriod, 'fastPeriod'),
      slowPeriodV: validatePeriod(slowPeriod, 'slowPeriod'),
      signalPeriodV: validatePeriod(signalPeriod, 'signalPeriod'),
      periodSizes: validatePeriodSizes(slowPeriod, fastPeriod),
      valuesV: validateValues(values, slowPeriod + signalPeriod, slowPeriod + signalPeriod),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.bind('emaSlow', ({ valuesB, slowPeriodV }) => emaC(valuesB, slowPeriodV)),
    E.bind('emaFast', ({ valuesB, fastPeriodV }) => emaC(valuesB, fastPeriodV)),
    E.bind('macdResult', ({ emaFast, emaSlow }) => E.right(calculate(emaFast, emaSlow))),
    E.bind('signal', ({ macdResult, signalPeriodV }) => emaC(macdResult, signalPeriodV)),
    E.map(({ macdResult, signal }) => ({ macd: trimLeft(macdResult, signal), signal })),
  );
