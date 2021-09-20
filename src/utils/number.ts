import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';
import { NotPositiveIntegerError } from '../errors';

/**
 * Safely convert `number` to `Big`.
 *
 * @internal
 */
export const toBig = (value: number): E.Either<Error, Big> =>
  E.tryCatch(
    () => new Big(value),
    (e) => E.toError(e),
  );

/**
 * Validate positive Integer.
 *
 * @internal
 */
export const validatePositiveInteger = (period: number): E.Either<Error, number> =>
  period > 0 && Number.isInteger(period) ? E.right(period) : E.left(new NotPositiveIntegerError());
