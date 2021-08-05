import { Big } from 'big.js';
import { either as E, readonlyRecord as RR } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { BigObject, HighLowClose, HighLowCloseB, NumberObject } from '../types';

/**
 * Like `Math.max()` just for `Big`.
 *
 * @internal
 */
export const max = (values: readonly Big[]): Big =>
  values.reduce((reduced, value) => (value.gt(reduced) ? value : reduced), new Big(0));

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
 * Safely convert `Readonly<number[]>` to `Readonly<Big[]>`.
 *
 * @internal
 */
export const arrayToBig = E.traverseArray(numberToBig);

/**
 * Safely convert `Readonly<Record<string, Readonly<number[]>>>`
 * to `Readonly<Record<string, Readonly<Big[]>>>`.
 *
 * @internal
 */
// prettier-ignore
export const objectToBig = ((
  obj: NumberObject | HighLowClose,
): E.Either<Error, BigObject | HighLowCloseB> =>
  pipe(obj, RR.traverse(E.Applicative)(arrayToBig))) as
  ((obj: HighLowClose) => E.Either<Error, HighLowCloseB>) &
  ((obj: NumberObject) => E.Either<Error, BigObject>);
