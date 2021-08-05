import { Big } from 'big.js';
import { apply as AP, either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { arrayToBig, numberToBig } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { dmaC } from './dma';

const getFactor = (period: number): E.Either<Error, Big> =>
  pipe(
    period,
    numberToBig,
    E.map((periodB) => new Big(1).div(periodB)),
  );

/**
 * SMMA without checks and conversion.
 *
 * @internal
 */
export const smmaC = (values: readonly Big[], period: number): E.Either<Error, readonly Big[]> =>
  pipe(
    period,
    getFactor,
    E.map((factorB) => dmaC(values, period, factorB)),
  );

/**
 * The Smoothed Moving Average (SMMA) is like the Exponential Moving Average (EMA),
 * with just a “smoother” factor. It can be used to identify support and resistance levels.
 * Also prices above the SMMA can indicate uptrends, prices below can indicate downtrends.
 *
 * @public
 */
export const smma = (values: readonly number[], period = 20): E.Either<Error, readonly Big[]> =>
  pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.chain(({ valuesB, periodV }) => smmaC(valuesB, periodV)),
  );
