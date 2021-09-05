import {
  either as E,
  function as F,
  readonlyArray as RA,
  readonlyNonEmptyArray as RNEA,
} from 'fp-ts';
import { EmptyArrayError } from '../errors';

/**
 * Create new `ReadonlyNonEmptyArray` from given `ReadonlyNonEmptyArray`
 * by keeping number of values from right.
 *
 * @internal
 */
export const nonEmptyTakeRight =
  (number: number) =>
  <A>(array: RNEA.ReadonlyNonEmptyArray<A>): RNEA.ReadonlyNonEmptyArray<A> =>
    F.pipe(array, RA.takeRight(number), (taken) => (RA.isNonEmpty(taken) ? taken : array));

/**
 * Get all but the first of an `ReadonlyNonEmptyArray` as `ReadonlyNonEmptyArray`
 *
 * @internal
 */
export const nonEmptyTail = <A>(
  array: RNEA.ReadonlyNonEmptyArray<A>,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<A>> =>
  F.pipe(array, RNEA.tail, (rest) =>
    RA.isNonEmpty(rest) ? E.right(rest) : E.left(new EmptyArrayError()),
  );
