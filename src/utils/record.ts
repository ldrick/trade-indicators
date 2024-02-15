import { Big } from 'big.js';
import { either as E, function as F, readonlyRecord as RR } from 'fp-ts/lib';

import * as array from './array.js';
import {
	HighLowClose,
	NonEmptyHighLowClose,
	ReadonlyRecordArray,
	ReadonlyRecordNonEmptyArray,
} from '../types.js';

/**
 * Safely convert `RR.ReadonlyRecord<string, RNEA.ReadonlyNonEmptyArray<number>>>`
 * to `RR.ReadonlyRecord<string, RNEA.ReadonlyNonEmptyArray<Big>>>`.
 * @internal
 */
export const toBig = ((
	object: ReadonlyRecordNonEmptyArray<number> | NonEmptyHighLowClose<number>,
): E.Either<Error, ReadonlyRecordNonEmptyArray<Big> | NonEmptyHighLowClose<Big>> =>
	F.pipe(object, RR.traverse(E.Applicative)(array.toBig))) as ((
	object: NonEmptyHighLowClose<number>,
) => E.Either<Error, NonEmptyHighLowClose<Big>>) &
	((object: ReadonlyRecordNonEmptyArray<number>) => E.Either<Error, ReadonlyRecordNonEmptyArray<Big>>);

/**
 * Validates if every Array in Record has the required size.
 * @internal
 */
export const validateRequiredSize = ((required: number) =>
	<A>(
		record: ReadonlyRecordArray<A> | HighLowClose<A>,
	): E.Either<Error, ReadonlyRecordNonEmptyArray<A> | NonEmptyHighLowClose<A>> =>
		F.pipe(record, RR.traverse(E.Applicative)(array.validateRequiredSize(required)))) as ((
	required: number,
) => <A>(record: HighLowClose<A>) => E.Either<Error, NonEmptyHighLowClose<A>>) &
	((
		required: number,
	) => <A>(record: ReadonlyRecordArray<A>) => E.Either<Error, ReadonlyRecordNonEmptyArray<A>>);
