import { either as E } from 'fp-ts';

import { type Result } from '../types.js';

/**
 * Convert the internal `Either` into the public `Result`.
 * All errors created in `src/` are `IndicatorError`s.
 * @internal
 */
export const fromEither = <A>(either: E.Either<Error, A>): Result<A> =>
	E.isLeft(either) ? { error: either.left, ok: false } : { ok: true, value: either.right };
