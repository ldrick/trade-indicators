import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { arrayToBig } from '../utils';
import { validatePeriod, validateValues } from '../validations';
import { emaC } from './ema';

const calculate = (
  one: RNEA.ReadonlyNonEmptyArray<Big>,
  two: RNEA.ReadonlyNonEmptyArray<Big>,
  period: number,
): RNEA.ReadonlyNonEmptyArray<Big> =>
  F.pipe(
    two,
    RNEA.mapWithIndex((index, value) => one[index + period - 1].mul(2).sub(value)),
  );

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
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Applicative)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateValues(values, 2 * period - 1, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.bind('emaOne', ({ valuesB, periodV }) => emaC(valuesB, periodV)),
    E.bind('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
    E.map(({ emaOne, emaTwo, periodV }) => calculate(emaOne, emaTwo, periodV)),
  );
