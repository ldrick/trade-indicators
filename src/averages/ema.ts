import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { arrayToBig, numberToBig } from '../utils';
import { validatePeriod, validateValues } from '../validations';
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
  values: RNEA.ReadonlyNonEmptyArray<Big>,
  period: number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
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
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Applicative)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateValues(values, period, period),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.chain(({ valuesB, periodV }) => emaC(valuesB, periodV)),
  );
