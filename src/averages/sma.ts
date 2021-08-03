import { Big } from 'big.js';
import { apply as AP, either as E, option as O, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { arrayToBig } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { amean } from './amean';

const calculate = (values: readonly Big[], period: number): readonly Big[] =>
  values.reduce(
    (reduced, _value, index, array) =>
      pipe(
        index + 1 >= period
          ? RNEA.fromReadonlyArray(array.slice(reduced.length, index + 1))
          : O.none,
        O.map((part) => [...reduced, amean(part)]),
        O.getOrElse(() => reduced),
      ),
    <readonly Big[]>[],
  );

/**
 * The Simple Moving Average (SMA) calculates the arithmetic mean of prices over an period.
 * It can be used to identify support and resistance levels.
 * Also prices above the SMA can indicate uptrends, prices below can indicate downtrends.
 *
 * @public
 */
export const sma = (values: readonly number[], period = 20): E.Either<Error, readonly Big[]> =>
  pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.map(({ valuesB, periodV }) => calculate(valuesB, periodV)),
  );
