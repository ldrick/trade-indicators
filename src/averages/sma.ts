import { Big } from 'big.js';
import {
  apply as AP,
  either as E,
  function as F,
  option as O,
  readonlyNonEmptyArray as RNEA,
} from 'fp-ts/lib';
import { arrayToBig } from '../utils';
import { validatePeriod, validateValues } from '../validations';
import { amean } from './amean';

const calculate = (
  values: RNEA.ReadonlyNonEmptyArray<Big>,
  period: number,
): RNEA.ReadonlyNonEmptyArray<Big> =>
  values.reduce(
    (reduced, _value, index, array) =>
      F.pipe(
        index + 1 >= period
          ? RNEA.fromReadonlyArray(array.slice(reduced.length, index + 1))
          : O.none,
        O.map((part) => [...reduced, amean(part)]),
        O.getOrElse(() => reduced),
      ),
    <ReadonlyArray<Big>>[],
  );

/**
 * The Simple Moving Average (SMA) calculates the arithmetic mean of prices over an period.
 * It can be used to identify support and resistance levels.
 * Also prices above the SMA can indicate uptrends, prices below can indicate downtrends.
 *
 * @public
 */
export const sma = (
  values: ReadonlyArray<number>,
  period = 20,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateValues(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.map(({ valuesB, periodV }) => calculate(valuesB, periodV)),
  );
