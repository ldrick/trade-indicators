import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { arrayToBig } from '../utils';
import { validatePeriod, validateValues } from '../validations';
import { amean } from './amean';
import { ma } from './ma';

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
    AP.sequenceS(E.Applicative)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateValues(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.chain(({ valuesB, periodV }) => ma(valuesB, periodV, amean)),
  );
