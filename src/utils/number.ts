import * as R from 'effect/Result';

import { NotFiniteNumberError } from '../errors/NotFiniteNumberError.js';
import { NotPositiveIntegerError } from '../errors/NotPositiveIntegerError.js';

/**
 * Validate finite Number (not `NaN`, `Infinity` or `-Infinity`).
 * @internal
 */
export const validateFinite = (value: number): R.Result<number, Error> =>
	Number.isFinite(value) ? R.succeed(value) : R.fail(new NotFiniteNumberError());

/**
 * Validate positive Integer.
 * @internal
 */
export const validatePositiveInteger = (period: number): R.Result<number, Error> =>
	period > 0 && Number.isSafeInteger(period)
		? R.succeed(period)
		: R.fail(new NotPositiveIntegerError());
