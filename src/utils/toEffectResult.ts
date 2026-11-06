import * as R from 'effect/Result';

import { type Result } from '../types.js';

/**
 * Transform a `Result` into an Effect `Result` (effect v4) for use in Effect pipelines.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { pipe } from 'effect/Function';
 * import * as R from 'effect/Result';
 * import { sma } from '@ldrick/trade-indicators/averages/sma.js';
 * import { toEffectResult } from '@ldrick/trade-indicators/toEffectResult.js';
 *
 * const last = pipe(
 * 	toEffectResult(sma([1, 2, 3, 4], 2)),
 * 	R.map((values) => values.at(-1)),
 * );
 * assert.deepStrictEqual(last, R.succeed(3.5));
 * ```
 * @category adapters
 * @since 0.9.0
 * @public
 */
export const toEffectResult = <A, E extends Error>(result: Result<A, E>): R.Result<A, E> =>
	result.ok ? R.succeed(result.value) : R.fail(result.error);
