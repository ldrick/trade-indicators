import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { arrayToBig } from '../utils';
import { validatePeriod, validateValues } from '../validations';
import { ma } from './ma';
import { wamean } from './wamean';

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
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Applicative)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateValues(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.chain(({ valuesB, periodV }) => ma(valuesB, periodV, wamean)),
  );
