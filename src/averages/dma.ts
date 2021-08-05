import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyArray as RA } from 'fp-ts/lib';
import { InfinitNumberError } from '../errors';
import { arrayToBig, numberToBig, previous } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { amean } from './amean';

const validateFactor = (factor?: number): E.Either<Error, number | undefined> =>
  factor === undefined || Number.isFinite(factor)
    ? E.right(factor)
    : E.left(new InfinitNumberError());

const defaultFactor = (period: number): E.Either<Error, Big> =>
  F.pipe(
    period,
    numberToBig,
    E.map((periodB) => new Big(2).div(periodB.add(1))),
  );

const factorToBig = (period: number, factor?: number): E.Either<Error, Big> =>
  factor ? numberToBig(factor) : defaultFactor(period);

/**
 * DMA without checks and conversion.
 *
 * @internal
 */
export const dmaC = (
  values: ReadonlyArray<Big>,
  period: number,
  factor: Big,
): ReadonlyArray<Big> => {
  const [init, rest] = RA.splitAt(period)(values);

  if (RA.isNonEmpty(init)) {
    return F.pipe(
      rest,
      RA.reduce([amean(init)], (reduced, value) => {
        const prev = previous(reduced);

        return [...reduced, value.sub(prev).mul(factor).add(prev)];
      }),
    );
  }

  return [];
};

/**
 * The Dynamic Moving Average (DMA) is the base implementation for the
 * Exponential Moving Average (EMA) and the Smoothed Moving Average (SMMA) by providing a factor.
 * It can be used to identify support and resistance levels.
 * Also prices above the DMA can indicate uptrends, prices below can indicate downtrends.
 *
 * @public
 */
export const dma = (
  values: ReadonlyArray<number>,
  period = 20,
  factor?: number,
): E.Either<Error, ReadonlyArray<Big>> =>
  F.pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, period, period),
      factorV: validateFactor(factor),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.bind('factorB', ({ periodV, factorV }) => factorToBig(periodV, factorV)),
    E.map(({ valuesB, periodV, factorB }) => dmaC(valuesB, periodV, factorB)),
  );
