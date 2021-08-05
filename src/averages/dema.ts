import { Big } from 'big.js';
import { apply as AP, either as E, function as F } from 'fp-ts/lib';
import { arrayToBig } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { emaC } from './ema';

const calculate = (
  one: ReadonlyArray<Big>,
  two: ReadonlyArray<Big>,
  period: number,
): ReadonlyArray<Big> => two.map((value, index) => one[index + period - 1].mul(2).sub(value));

/**
 * The Double Exponential Moving Average (DEMA) uses two Exponential Moving Average (EMA)
 * to reduce noise. It can be used to identify support and resistance levels.
 * Also prices above the DEMA can indicate uptrends, prices below can indicate downtrends.
 *
 * @public
 */
export const dema = (
  values: ReadonlyArray<number>,
  period = 20,
): E.Either<Error, ReadonlyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, 2 * period - 1, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.bind('emaOne', ({ valuesB, periodV }) => emaC(valuesB, periodV)),
    E.bind('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
    E.map(({ emaOne, emaTwo, periodV }) => calculate(emaOne, emaTwo, periodV)),
  );
