import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';

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
