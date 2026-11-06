import { either as E, function as F, readonlyRecord as RR } from 'fp-ts';

import { type HighLowClose, type NonEmptyHighLowClose } from '../types.js';
import * as array from './array.js';

/**
 * Validates if every value of every Array in Record is a finite Number.
 * @internal
 */
export const validateFinite = (
	record: NonEmptyHighLowClose<number>,
): E.Either<Error, NonEmptyHighLowClose<number>> =>
	F.pipe(record, RR.traverse(E.Applicative)(array.validateFinite));

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
			RR.traverse(E.Applicative)((a) =>
				array.validateRequiredSize(required)(a as readonly A[]),
			),
		);
