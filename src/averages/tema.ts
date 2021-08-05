import { Big } from 'big.js';
import { apply as AP, either as E, function as F } from 'fp-ts/lib';
import { arrayToBig } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { emaC } from './ema';

const calculate = (
  one: ReadonlyArray<Big>,
  two: ReadonlyArray<Big>,
  three: ReadonlyArray<Big>,
  period: number,
): ReadonlyArray<Big> =>
  three.map((value, index) =>
    one[index + 2 * (period - 1)]
      .mul(3)
      .sub(two[index + period - 1].mul(3))
      .add(value),
  );

/**
 * The Triple Exponential Moving Average (TEMA) uses three Exponential Moving Average (EMA)
 * to reduce noise and still get close to latest prices.
 * It can be used to identify support and resistance levels.
 * Also prices above the TEMA can indicate uptrends, prices below can indicate downtrends.
 *
 * @public
 */
export const tema = (
  values: ReadonlyArray<number>,
  period = 20,
): E.Either<Error, ReadonlyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, 3 * period - 2, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.bind('emaOne', ({ valuesB, periodV }) => emaC(valuesB, periodV)),
    E.bind('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
    E.bind('emaThree', ({ emaTwo, periodV }) => emaC(emaTwo, periodV)),
    E.map(({ emaOne, emaTwo, emaThree, periodV }) => calculate(emaOne, emaTwo, emaThree, periodV)),
  );
