import { Big } from 'big.js';
import {
  either as E,
  function as F,
  readonlyArray as RA,
  readonlyNonEmptyArray as RNEA,
} from 'fp-ts/lib';
import { NotEnoughDataError } from '../errors';

/**
 * Moving Average
 *
 * @internal
 */
export const ma = (
  values: RNEA.ReadonlyNonEmptyArray<Big>,
  period: number,
  cb: (v: RNEA.ReadonlyNonEmptyArray<Big>) => Big,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
  F.pipe(
    RNEA.range(0, values.length - period),
    RNEA.traverseWithIndex(E.Applicative)((index) => {
      const part = values.slice(index, period + index);
      return RA.isNonEmpty(part) && part.length === period
        ? E.right(cb(part))
        : E.left(new NotEnoughDataError(period, period));
    }),
  );
