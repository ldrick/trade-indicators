import { Big } from 'big.js';
import {
  either as E,
  function as F,
  readonlyArray as RA,
  readonlyNonEmptyArray as RNEA,
} from 'fp-ts/lib';
import { NotEnoughDataError } from '../errors';
import { amean } from './amean';

/**
 * Base implementation for the Exponential Moving Average (EMA) and
 * the Smoothed Moving Average (SMMA) by providing a factor.
 *
 * @internal
 */
export const dma = (
  values: RNEA.ReadonlyNonEmptyArray<Big>,
  period: number,
  factor: Big,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> => {
  const [init, rest] = RNEA.splitAt(period)(values);
  return F.pipe(
    rest,
    E.fromPredicate(
      (r) => RA.isNonEmpty(r),
      () => new NotEnoughDataError(period, period),
    ),
    E.map(
      RA.reduce(<RNEA.ReadonlyNonEmptyArray<Big>>[amean(init)], (reduced, value) => {
        const prev = RNEA.last(reduced);
        return RA.append(value.sub(prev).mul(factor).add(prev))(reduced);
      }),
    ),
  );
};
