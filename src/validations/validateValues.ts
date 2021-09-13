import {
  either as E,
  function as F,
  readonlyArray as RA,
  readonlyNonEmptyArray as RNEA,
  readonlyRecord as RR,
} from 'fp-ts/lib';
import { InfinitNumberError, NotEnoughDataError } from '../errors';
import { ReadonlyNonEmptyValuesNumber, ReadonlyRecordNumber, ReadonlyValuesNumber } from '../types';

const hasRequiredLength =
  <A>(required: number) =>
  (array: ReadonlyArray<A>): array is RNEA.ReadonlyNonEmptyArray<A> =>
    RA.isNonEmpty(array) && array.length >= required;

const hasRequiredValues = (
  values: ReadonlyValuesNumber,
  required: number,
): values is ReadonlyNonEmptyValuesNumber =>
  values instanceof Array
    ? hasRequiredLength(required)(values)
    : RR.every(hasRequiredLength(required))(values);

const validateLength =
  (required: number, period: number) =>
  (values: ReadonlyValuesNumber): E.Either<Error, ReadonlyNonEmptyValuesNumber> =>
    hasRequiredValues(values, required)
      ? E.right(values)
      : E.left(new NotEnoughDataError(period, required));

const everyIsFinite = (array: readonly number[]): boolean =>
  RA.every((n) => Number.isFinite(n))(array);

const validateFinity = (
  values: ReadonlyNonEmptyValuesNumber,
): E.Either<Error, ReadonlyNonEmptyValuesNumber> => {
  const verifier =
    values instanceof Array ? everyIsFinite(values) : RR.every(everyIsFinite)(values);
  return verifier ? E.right(values) : E.left(new InfinitNumberError());
};

/**
 * Validate a data `ReadonlyArray<number>` or `Readonly<Record<string, ReadonlyArray<number>>>`
 *
 * @internal
 */
export const validateValues = ((
  values: ReadonlyValuesNumber,
  required: number,
  period: number,
): E.Either<Error, ReadonlyNonEmptyValuesNumber> =>
  F.pipe(values, validateLength(required, period), E.chain(validateFinity))) as ((
  values: ReadonlyArray<number>,
  required: number,
  period: number,
) => E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>>) &
  (<A extends ReadonlyRecordNumber, B extends ReadonlyNonEmptyValuesNumber>(
    values: A,
    required: number,
    period: number,
  ) => E.Either<Error, B>);
