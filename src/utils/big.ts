import { Big } from 'big.js';
import { array as A, either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { BigObject, NumberObject } from '../types';

export const max = (values: readonly Big[]): Big =>
  values.reduce((reduced, value) => (value.gt(reduced) ? value : reduced), new Big(0));

export const numberToBig = (value: number): E.Either<Error, Big> =>
  E.tryCatch(
    () => new Big(value),
    (reason) => reason as Error,
  );

export const arrayToBig = (array: readonly number[]): E.Either<Error, readonly Big[]> =>
  pipe(array.map(numberToBig), A.sequence(E.Applicative));

export const objectToBig = <A extends BigObject>(obj: NumberObject): E.Either<Error, A> =>
  pipe(
    Object.values(obj).map(arrayToBig),
    A.sequence(E.Applicative),
    E.map((values) =>
      Object.keys(obj).reduce(
        (reduced, key, index) => ({
          ...reduced,
          ...{ [key]: values[index] },
        }),
        <A>{},
      ),
    ),
  );
