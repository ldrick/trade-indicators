import { Big } from 'big.js';
import { either as E, function as F, readonlyRecord as RR } from 'fp-ts';

import { type HighLowClose, type NonEmptyHighLowClose } from '../types.js';
import * as array from './array.js';

/**
 * Safely convert `RR.ReadonlyRecord<string, RNEA.ReadonlyNonEmptyArray<number>>>`
 * to `RR.ReadonlyRecord<string, RNEA.ReadonlyNonEmptyArray<Big>>>`.
 * @internal
 */
export const toBig = (
	record: NonEmptyHighLowClose<number>,
): E.Either<Error, NonEmptyHighLowClose<Big>> =>
	F.pipe(record, RR.traverse(E.Applicative)(array.toBig));

/**
 * Validates if every Array in Record has the required size.
 * @internal
 */
export const validateRequiredSize =
	(required: number) =>
	<A>(record: HighLowClose<A>): E.Either<Error, NonEmptyHighLowClose<A>> =>
		F.pipe(
			record,
			// Not so cool, type inference for "a" is not working as expected
			RR.traverse(E.Applicative)((a) => array.validateRequiredSize(required)(a as readonly A[])),
		);
