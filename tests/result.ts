import { type Result } from '../src/types.js';

/**
Expected failed `Result`.
 */
export const failure = <E extends Error>(error: E): Result<never, E> => ({ error, ok: false });

/**
Expected successful `Result`.
 */
export const success = <A>(value: A): Result<A, never> => ({ ok: true, value });
