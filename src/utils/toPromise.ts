import { type Result } from '../types.js';

/**
 * Transform a `Result` into a `Promise`, which rejects with the error.
 * @public
 */
export const toPromise = <A, E extends Error>(result: Result<A, E>): Promise<A> =>
	result.ok ? Promise.resolve(result.value) : Promise.reject(result.error);
