import { Big } from 'big.js';
import {
  either as E,
  function as F,
  ord as ORD,
  readonlyNonEmptyArray as RNEA,
  readonlyRecord as RR,
} from 'fp-ts/lib';
import {
  ReadonlyNonEmptyHighLowCloseBig,
  ReadonlyNonEmptyHighLowCloseNumber,
  ReadonlyNonEmptyRecordBig,
  ReadonlyNonEmptyRecordNumber,
} from '../types';

export const ord: ORD.Ord<Big> = {
  /**
   * Big equals.
   *
   * @internal
   */
  equals: (first, second) => first.eq(second),
  /**
   * Big compare.
   *
   * @internal
   */
  compare: (first, second) => (first.lt(second) ? -1 : first.gt(second) ? 1 : 0),
};

/**
 * Like `Math.max()` just for `Big`.
 *
 * @internal
 */
export const max = (values: RNEA.ReadonlyNonEmptyArray<Big>): Big => F.pipe(values, RNEA.max(ord));

/**
 * Safely convert `number` to `Big`.
 *
 * @internal
 */
export const numberToBig = (value: number): E.Either<Error, Big> =>
  E.tryCatch(
    () => new Big(value),
    (e) => E.toError(e),
  );

/**
 * Safely convert `RNEA.ReadonlyNonEmptyArray<number>` to `RNEA.ReadonlyNonEmptyArray<Big>`.
 *
 * @internal
 */
export const arrayToBig = RNEA.traverse(E.Applicative)(numberToBig);

/**
 * Safely convert `RR.ReadonlyRecord<string, RNEA.ReadonlyNonEmptyArray<number>>>`
 * to `RR.ReadonlyRecord<string, RNEA.ReadonlyNonEmptyArray<Big>>>`.
 *
 * @internal
 */
export const objectToBig = ((
  obj: ReadonlyNonEmptyRecordNumber | ReadonlyNonEmptyHighLowCloseNumber,
): E.Either<Error, ReadonlyNonEmptyRecordBig | ReadonlyNonEmptyHighLowCloseBig> =>
  F.pipe(obj, RR.traverse(E.Applicative)(arrayToBig))) as ((
  obj: ReadonlyNonEmptyHighLowCloseNumber,
) => E.Either<Error, ReadonlyNonEmptyHighLowCloseBig>) &
  ((obj: ReadonlyNonEmptyRecordNumber) => E.Either<Error, ReadonlyNonEmptyRecordBig>);
