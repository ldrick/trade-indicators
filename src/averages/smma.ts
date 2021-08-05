import { Big } from 'big.js';
import { apply as AP, either as E, function as F } from 'fp-ts/lib';
import { arrayToBig, numberToBig } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { dmaC } from './dma';

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
  values: ReadonlyArray<Big>,
  period: number,
): E.Either<Error, ReadonlyArray<Big>> =>
  F.pipe(
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
export const smma = (
  values: ReadonlyArray<number>,
  period = 20,
): E.Either<Error, ReadonlyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.chain(({ valuesB, periodV }) => smmaC(valuesB, periodV)),
  );
