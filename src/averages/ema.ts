import { Big } from 'big.js';
import { apply as AP, either as E, function as F } from 'fp-ts/lib';
import { arrayToBig, numberToBig } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { dmaC } from './dma';

const factor = (period: number): E.Either<Error, Big> =>
  F.pipe(
    period,
    numberToBig,
    E.map((periodB) => new Big(2).div(periodB.add(1))),
  );

/**
 * EMA without checks and conversion.
 *
 * @internal
 */
export const emaC = (
  values: ReadonlyArray<Big>,
  period: number,
): E.Either<Error, ReadonlyArray<Big>> =>
  F.pipe(
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
export const ema = (
  values: ReadonlyArray<number>,
  period = 20,
): E.Either<Error, ReadonlyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.chain(({ valuesB, periodV }) => emaC(valuesB, periodV)),
  );
