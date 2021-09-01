import { Big } from 'big.js';
import {
  either as E,
  function as F,
  readonlyArray as RA,
  readonlyNonEmptyArray as RNEA,
  readonlyRecord as RR,
} from 'fp-ts/lib';
import {
  ReadonlyNonEmptyHighLowCloseBig,
  ReadonlyNonEmptyHighLowCloseNumber,
  ReadonlyNonEmptyRecordBig,
  ReadonlyNonEmptyRecordNumber,
} from '../types';

/**
 * Like `Math.max()` just for `Big`.
 *
 * @internal
 */
export const max = (values: ReadonlyArray<Big>): Big =>
  F.pipe(
    values,
    RA.reduce(new Big(0), (reduced, value) => (value.gt(reduced) ? value : reduced)),
  );

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
