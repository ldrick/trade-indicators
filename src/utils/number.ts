import { either as E } from 'fp-ts';

import { NotFiniteNumberError } from '../errors/NotFiniteNumberError.js';
import { NotPositiveIntegerError } from '../errors/NotPositiveIntegerError.js';

/**
 * Validate finite Number (not `NaN`, `Infinity` or `-Infinity`).
 * @internal
 */
export const validateFinite = (value: number): E.Either<Error, number> =>
	Number.isFinite(value) ? E.right(value) : E.left(new NotFiniteNumberError());

/**
 * Validate positive Integer.
 * @internal
 */
export const validatePositiveInteger = (period: number): E.Either<Error, number> =>
	period > 0 && Number.isSafeInteger(period)
		? E.right(period)
		: E.left(new NotPositiveIntegerError());
