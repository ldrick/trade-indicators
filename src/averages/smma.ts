import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { arrayToBig, numberToBig } from '../utils';
import { validatePeriod, validateValues } from '../validations';
import { dma } from './dma';

const getFactor = (period: number): E.Either<Error, Big> =>
  F.pipe(
    period,
    numberToBig,
    E.map((periodB) => new Big(1).div(periodB)),
  );

/**
 * SMMA without checks and conversion.
 *
 * @internal
 */
export const smmaC = (
  values: RNEA.ReadonlyNonEmptyArray<Big>,
  period: number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    period,
    getFactor,
    E.map((factorB) => dma(values, period, factorB)),
  );

/**
 * The Smoothed Moving Average (SMMA) is like the Exponential Moving Average (EMA),
 * with just a “smoother” factor. It can be used to identify support and resistance levels.
 * Also prices above the SMMA can indicate uptrends, prices below can indicate downtrends.
 *
 * @public
 */
export const smma = (
  values: ReadonlyArray<number>,
  period = 20,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Applicative)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateValues(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.chain(({ valuesB, periodV }) => smmaC(valuesB, periodV)),
  );
