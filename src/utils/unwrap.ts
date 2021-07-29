import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { BigObject, NumberObject } from '../types';

const mapBigArray = (values: readonly Big[]): readonly number[] =>
  values.map((value) => value.toNumber());

const mapBigObject = (values: BigObject): NumberObject =>
  Object.keys(values).reduce(
    (reduced, key) => ({ ...reduced, ...{ [key]: values[key].map((value) => value.toNumber()) } }),
    {},
  );

export function unwrap(values: E.Either<Error, readonly Big[]>): Promise<readonly number[]>;
export function unwrap(values: E.Either<Error, BigObject>): Promise<NumberObject>;
export function unwrap(
  values: E.Either<Error, readonly Big[] | BigObject>,
): Promise<readonly number[] | NumberObject> {
  return pipe(
    values,
    E.fold(
      (error) => Promise.reject(error),
      (result) =>
        result instanceof Array
          ? Promise.resolve(mapBigArray(result))
          : Promise.resolve(mapBigObject(result)),
    ),
  );
}
