import { Big } from 'big.js';
import {
  apply as AP,
  either as E,
  function as F,
  option as O,
  readonlyNonEmptyArray as RNEA,
} from 'fp-ts/lib';
import { arrayToBig } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { wamean } from './wamean';

const calculate = (values: ReadonlyArray<Big>, period: number): ReadonlyArray<Big> =>
  values.reduce(
    (reduced, _value, index, array) =>
      F.pipe(
        index + 1 >= period
          ? RNEA.fromReadonlyArray(array.slice(reduced.length, index + 1))
          : O.none,
        O.map((part) => [...reduced, wamean(part)]),
        O.getOrElse(() => reduced),
      ),
    <ReadonlyArray<Big>>[],
  );

/**
 * The Weighted Moving Average (WMA) takes newer values weighted into account
 * and reacts closer to the prices compared to the Simple Moving Average (SMA).
 * It can be used to identify support and resistance levels.
 * Also prices above the WMA can indicate uptrends, prices below can indicate downtrends.
 *
 * @public
 */
export const wma = (
  values: ReadonlyArray<number>,
  period = 20,
): E.Either<Error, ReadonlyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.map(({ valuesB, periodV }) => calculate(valuesB, periodV)),
  );
