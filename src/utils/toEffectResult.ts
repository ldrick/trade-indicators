import * as R from 'effect/Result';

import { type Result } from '../types.js';

/**
 * Transform a `Result` into an Effect `Result` (effect v4) for use in Effect pipelines.
 * @public
 */
export const toEffectResult = <A, E extends Error>(result: Result<A, E>): R.Result<A, E> =>
	result.ok ? R.succeed(result.value) : R.fail(result.error);
