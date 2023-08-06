import { Big } from 'big.js';
import { either as E, function as F, readonlyRecord as RR } from 'fp-ts/lib';
import {
	HighLowClose,
	NonEmptyHighLowClose,
	ReadonlyRecordArray,
	ReadonlyRecordNonEmptyArray,
} from '../types.js';
import * as arr from './array.js';

/**
 * Safely convert `RR.ReadonlyRecord<string, RNEA.ReadonlyNonEmptyArray<number>>>`
 * to `RR.ReadonlyRecord<string, RNEA.ReadonlyNonEmptyArray<Big>>>`.
 * @internal
 */
export const toBig = ((
	obj: ReadonlyRecordNonEmptyArray<number> | NonEmptyHighLowClose<number>,
): E.Either<Error, ReadonlyRecordNonEmptyArray<Big> | NonEmptyHighLowClose<Big>> =>
	F.pipe(obj, RR.traverse(E.Applicative)(arr.toBig))) as ((
	obj: NonEmptyHighLowClose<number>,
) => E.Either<Error, NonEmptyHighLowClose<Big>>) &
	((obj: ReadonlyRecordNonEmptyArray<number>) => E.Either<Error, ReadonlyRecordNonEmptyArray<Big>>);

/**
 * Validates if every Array in Record has the required size.
 * @internal
 */
export const validateRequiredSize = ((required: number) =>
	<A>(
		record: ReadonlyRecordArray<A> | HighLowClose<A>,
	): E.Either<Error, ReadonlyRecordNonEmptyArray<A> | NonEmptyHighLowClose<A>> =>
		F.pipe(record, RR.traverse(E.Applicative)(arr.validateRequiredSize(required)))) as ((
	required: number,
) => <A>(record: HighLowClose<A>) => E.Either<Error, NonEmptyHighLowClose<A>>) &
	((
		required: number,
	) => <A>(record: ReadonlyRecordArray<A>) => E.Either<Error, ReadonlyRecordNonEmptyArray<A>>);
