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

/**
 * Provides a way to transform each Result of the other Modules to respective
 * `Promise<readonly number[]>` or `Promise<Record<string, readonly number[]>>`.
 */
export const unwrap = (
  values: E.Either<Error, readonly Big[] | BigObject>,
): Promise<readonly number[] | NumberObject> =>
  pipe(
    values,
    E.fold(
      (error) => Promise.reject(error),
      (result) =>
        result instanceof Array
          ? Promise.resolve(mapBigArray(result))
          : Promise.resolve(mapBigObject(result)),
    ),
  );
