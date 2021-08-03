import { Big } from 'big.js';
import { apply as AP, either as E, option as O, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { InfinitNumberError } from '../errors';
import { arrayToBig, numberToBig, previous } from '../utils';
import { validateData, validatePeriod } from '../validations';
import { amean } from './amean';

const validateFactor = (factor?: number): E.Either<Error, number | undefined> =>
  factor === undefined || Number.isFinite(factor)
    ? E.right(factor)
    : E.left(new InfinitNumberError());

const getDefaultFactor = (period: number): E.Either<Error, Big> =>
  pipe(
    period,
    numberToBig,
    E.map((periodB) => new Big(2).div(periodB.add(1))),
  );

const factorToBig = (period: number, factor?: number): E.Either<Error, Big> =>
  factor ? numberToBig(factor) : getDefaultFactor(period);

/**
 * DMA without checks and conversion.
 * Only for internal use.
 */
export const dmaC = (values: readonly Big[], period: number, factor: Big): readonly Big[] =>
  values.reduce(
    (reduced, value, index, array) =>
      pipe(
        index + 1 >= period ? RNEA.fromReadonlyArray(array.slice(0, period)) : O.none,
        O.map((firstPart) => {
          const prev = previous(reduced);
          return [
            ...reduced,
            reduced.length === 0 ? amean(firstPart) : value.sub(prev).mul(factor).add(prev),
          ];
        }),
        O.getOrElse(() => reduced),
      ),
    <readonly Big[]>[],
  );

/**
 * The Dynamic Moving Average (DMA) is the base implementation for the
 * Exponential Moving Average (EMA) and the Smoothed Moving Average (SMMA) by providing a factor.
 * It can be used to identify support and resistance levels.
 * Also prices above the DMA can indicate uptrends, prices below can indicate downtrends.
 *
 * @public
 */
export const dma = (
  values: readonly number[],
  period = 20,
  factor?: number,
): E.Either<Error, readonly Big[]> =>
  pipe(
    AP.sequenceS(E.Apply)({
      periodV: validatePeriod(period, 'period'),
      valuesV: validateData(values, period, period),
      factorV: validateFactor(factor),
    }),
    E.bind('valuesB', ({ valuesV }) => arrayToBig(valuesV)),
    E.bind('factorB', ({ periodV, factorV }) => factorToBig(periodV, factorV)),
    E.map(({ valuesB, periodV, factorB }) => dmaC(valuesB, periodV, factorB)),
  );
