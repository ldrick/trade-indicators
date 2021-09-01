import { Big } from 'big.js';
import {
  either as E,
  function as F,
  readonlyArray as RA,
  readonlyNonEmptyArray as RNEA,
} from 'fp-ts/lib';
import { NotEnoughDataError } from '../errors';

// TODO: further optimization possible?
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
    values,
    RNEA.splitAt(period - 1),
    ([, rest]) =>
      RA.isNonEmpty(rest) ? E.right(rest) : E.left(new NotEnoughDataError(period, period)),
    E.chain(
      RNEA.traverseWithIndex(E.Applicative)((index) => {
        const part = values.slice(index, period + index);
        return RA.isNonEmpty(part)
          ? E.right(cb(part))
          : E.left(new NotEnoughDataError(period, period));
      }),
    ),
  );
