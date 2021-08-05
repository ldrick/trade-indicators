import { Big } from 'big.js';
import { apply as AP, either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { arrayToBig, numberToBig } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { dmaC } from './dma';

const factor = (period: number): E.Either<Error, Big> =>
  pipe(
    period,
    numberToBig,
    E.map((periodB) => new Big(2).div(periodB.add(1))),
  );

/**
 * EMA without checks and conversion.
 *
 * @internal
 */
export const emaC = (values: readonly Big[], period: number): E.Either<Error, readonly Big[]> =>
  pipe(
    period,
    factor,
    E.map((factorB) => dmaC(values, period, factorB)),
  );

/**
 * The Exponential Moving Average (EMA) takes newer values weighted into account
 * and reacts closer to the prices compared to the Simple Moving Average (SMA).
 * It can be used to identify support and resistance levels.
 * Also prices above the EMA can indicate uptrends, prices below can indicate downtrends.
 *
 * @public
 */
export const ema = (values: readonly number[], period = 20): E.Either<Error, readonly Big[]> =>
  pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.chain(({ valuesB, periodV }) => emaC(valuesB, periodV)),
  );
