import { type Result } from '../types.js';

/**
 * Transform a `Result` into a `Promise`, which rejects with the error.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { sma } from '@ldrick/trade-indicators/averages/sma.js';
 * import { toPromise } from '@ldrick/trade-indicators/toPromise.js';
 *
 * assert.deepStrictEqual(await toPromise(sma([1, 2, 3], 2)), [1.5, 2.5]);
 * await assert.rejects(toPromise(sma([1], 2)), { name: 'NotEnoughDataError' });
 * ```
 * @category adapters
 * @since 0.4.0
 * @public
 */
export const toPromise = <A, E extends Error>(result: Result<A, E>): Promise<A> =>
	result.ok ? Promise.resolve(result.value) : Promise.reject(result.error);
