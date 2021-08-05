import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';
import { pipe } from 'fp-ts/lib/function';
import { BigObject, NumberObject } from '../types';

const mapBigArray = (values: ReadonlyArray<Big>): ReadonlyArray<number> =>
  values.map((value) => value.toNumber());

const mapBigObject = (values: BigObject): NumberObject =>
  Object.keys(values).reduce(
    (reduced, key) => ({ ...reduced, ...{ [key]: values[key].map((value) => value.toNumber()) } }),
    {},
  );

/**
 * Provides a way to transform each Result of the other Modules to respective
 * `Promise<ReadonlyArray<number>>` or `Promise<Readonly<Record<string, ReadonlyArray<number>>>>`.
 *
 * @public
 */
export const unwrap = (
  values: E.Either<Error, ReadonlyArray<Big> | BigObject>,
): Promise<ReadonlyArray<number> | NumberObject> =>
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
