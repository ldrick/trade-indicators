import { Big } from 'big.js';
import { either as E, function as F, readonlyArray as RA, readonlyRecord as RR } from 'fp-ts/lib';
import { ReadonlyRecordBig, ReadonlyRecordNumber } from '../types';

const toNumber = (b: Big): number => b.toNumber();

const mapBigArray = (values: ReadonlyArray<Big>): ReadonlyArray<number> => RA.map(toNumber)(values);

const mapReadonlyRecordBig = (values: ReadonlyRecordBig): ReadonlyRecordNumber =>
  RR.map(mapBigArray)(values);

/**
 * Provides a way to transform each Result of the other Modules to respective
 * `Promise<ReadonlyArray<number>>` or `Promise<Readonly<Record<string, ReadonlyArray<number>>>>`.
 *
 * @public
 */
export const unwrap = (
  values: E.Either<Error, ReadonlyArray<Big> | ReadonlyRecordBig>,
): Promise<ReadonlyArray<number> | ReadonlyRecordNumber> =>
  F.pipe(
    values,
    E.fold(
      (error) => Promise.reject(error),
      (result) =>
        result instanceof Array
          ? Promise.resolve(mapBigArray(result))
          : Promise.resolve(mapReadonlyRecordBig(result)),
    ),
  );
