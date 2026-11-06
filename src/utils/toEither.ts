import { type Result } from '../types.js';

/**
 * Structurally identical to fp-ts' `Either`, so no dependency on fp-ts is needed.
 * @public
 */
export type Either<E, A> =
	| Readonly<{ _tag: 'Left'; left: E }>
	| Readonly<{ _tag: 'Right'; right: A }>;

/**
 * Transform a `Result` into an fp-ts compatible `Either` for use in fp-ts pipelines.
 * @public
 */
export const toEither = <A, E extends Error>(result: Result<A, E>): Either<E, A> =>
	result.ok ? { _tag: 'Right', right: result.value } : { _tag: 'Left', left: result.error };
