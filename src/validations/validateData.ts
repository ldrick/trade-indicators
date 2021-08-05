import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { InfinitNumberError, NotEnoughDataError, UnequalArraySizesError } from '../errors';
import { ValuesInput } from '../types';

const validateLength = <A extends ValuesInput>(
  values: A,
  required: number,
  period: number,
): E.Either<Error, A> => {
  const verifier =
    values instanceof Array
      ? values.length >= required
      : Object.values(values).every((array) => array.length >= required);
  return verifier ? E.right(values) : E.left(new NotEnoughDataError(period, required));
};

const validateFinity = <A extends ValuesInput>(values: A): E.Either<Error, A> => {
  const verifier =
    values instanceof Array
      ? values.every((v) => Number.isFinite(v))
      : Object.values(values).every((array) => array.every((v) => Number.isFinite(v)));
  return verifier ? E.right(values) : E.left(new InfinitNumberError());
};

const validateEqualArraySizes = <A extends ValuesInput>(values: A): E.Either<Error, A> => {
  const verifier =
    values instanceof Array
      ? true
      : Object.values(values).every((array, _index, vals) => array.length === vals[0].length);
  return verifier ? E.right(values) : E.left(new UnequalArraySizesError());
};

/**
 * Validate an data `Array` or `Object`
 *
 * @internal
 */
export const validateData = <A extends ValuesInput>(
  values: A,
  required: number,
  period: number,
): E.Either<Error, A> =>
  pipe(
    validateLength(values, required, period),
    E.chain(validateEqualArraySizes),
    E.chain(validateFinity),
  );
