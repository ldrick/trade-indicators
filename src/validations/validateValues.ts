import {
  either as E,
  function as F,
  readonlyArray as RA,
  readonlyNonEmptyArray as RNEA,
} from 'fp-ts/lib';
import { InfinitNumberError, NotEnoughDataError, UnequalArraySizesError } from '../errors';
import { ReadonlyNonEmptyValuesNumber, ReadonlyRecordNumber, ReadonlyValuesNumber } from '../types';

const hasRequiredLength = <A>(
  array: ReadonlyArray<A>,
  required: number,
): array is RNEA.ReadonlyNonEmptyArray<A> => RA.isNonEmpty(array) && array.length >= required;

const hasRequiredValues = (
  values: ReadonlyValuesNumber,
  required: number,
): values is ReadonlyNonEmptyValuesNumber =>
  values instanceof Array
    ? hasRequiredLength(values, required)
    : Object.values(values).every((array) => hasRequiredLength(array, required));

const validateLength =
  (required: number, period: number) =>
  (values: ReadonlyValuesNumber): E.Either<Error, ReadonlyNonEmptyValuesNumber> =>
    hasRequiredValues(values, required)
      ? E.right(values)
      : E.left(new NotEnoughDataError(period, required));

const validateFinity = (
  values: ReadonlyNonEmptyValuesNumber,
): E.Either<Error, ReadonlyNonEmptyValuesNumber> => {
  const verifier =
    values instanceof Array
      ? values.every((v) => Number.isFinite(v))
      : Object.values(values).every((array) => array.every((v) => Number.isFinite(v)));
  return verifier ? E.right(values) : E.left(new InfinitNumberError());
};

const validateEqualArraySizes = (
  values: ReadonlyNonEmptyValuesNumber,
): E.Either<Error, ReadonlyNonEmptyValuesNumber> => {
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
export const validateValues = ((
  values: ReadonlyValuesNumber,
  required: number,
  period: number,
): E.Either<Error, ReadonlyNonEmptyValuesNumber> =>
  F.pipe(
    values,
    validateLength(required, period),
    E.chain(validateEqualArraySizes),
    E.chain(validateFinity),
  )) as ((
  values: ReadonlyArray<number>,
  required: number,
  period: number,
) => E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>>) &
  (<A extends ReadonlyRecordNumber, B extends ReadonlyNonEmptyValuesNumber>(
    values: A,
    required: number,
    period: number,
  ) => E.Either<Error, B>);
