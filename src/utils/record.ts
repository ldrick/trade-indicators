import { either as E, function as F, readonlyRecord as RR } from 'fp-ts/lib';
import {
  ReadonlyNonEmptyHighLowCloseBig,
  ReadonlyNonEmptyHighLowCloseNumber,
  ReadonlyNonEmptyRecordBig,
  ReadonlyNonEmptyRecordNumber,
} from '../types';
import * as arr from './array';

/**
 * Safely convert `RR.ReadonlyRecord<string, RNEA.ReadonlyNonEmptyArray<number>>>`
 * to `RR.ReadonlyRecord<string, RNEA.ReadonlyNonEmptyArray<Big>>>`.
 *
 * @internal
 */
export const toBig = ((
  obj: ReadonlyNonEmptyRecordNumber | ReadonlyNonEmptyHighLowCloseNumber,
): E.Either<Error, ReadonlyNonEmptyRecordBig | ReadonlyNonEmptyHighLowCloseBig> =>
  F.pipe(obj, RR.traverse(E.Applicative)(arr.toBig))) as ((
  obj: ReadonlyNonEmptyHighLowCloseNumber,
) => E.Either<Error, ReadonlyNonEmptyHighLowCloseBig>) &
  ((obj: ReadonlyNonEmptyRecordNumber) => E.Either<Error, ReadonlyNonEmptyRecordBig>);
