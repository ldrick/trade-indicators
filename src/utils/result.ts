import * as R from 'effect/Result';

import { type Result } from '../types.js';

/**
 * Convert the internal Effect `Result` into the public `Result`.
 * All errors created in `src/` are `IndicatorError`s, which are structurally plain `Error`s.
 * @internal
 */
export const fromResult = <A>(result: R.Result<A, Error>): Result<A> =>
	R.isFailure(result)
		? { error: result.failure, ok: false }
		: { ok: true, value: result.success };
