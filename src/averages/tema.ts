import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { arrayToBig } from '../utils';
import { validatePeriod, validateValues } from '../validations';
import { emaC } from './ema';

const calculate = (
  one: RNEA.ReadonlyNonEmptyArray<Big>,
  two: RNEA.ReadonlyNonEmptyArray<Big>,
  three: RNEA.ReadonlyNonEmptyArray<Big>,
  period: number,
): RNEA.ReadonlyNonEmptyArray<Big> =>
  F.pipe(
    three,
    RNEA.mapWithIndex((index, value) =>
      one[index + 2 * (period - 1)]
        .mul(3)
        .sub(two[index + period - 1].mul(3))
        .add(value),
    ),
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
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateValues(values, 3 * period - 2, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.bind('emaOne', ({ valuesB, periodV }) => emaC(valuesB, periodV)),
    E.bind('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
    E.bind('emaThree', ({ emaTwo, periodV }) => emaC(emaTwo, periodV)),
    E.map(({ emaOne, emaTwo, emaThree, periodV }) => calculate(emaOne, emaTwo, emaThree, periodV)),
  );
