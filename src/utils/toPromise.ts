import { either as E, function as F } from 'fp-ts';

/**
 * Provides a way to transform Either to Promise.
 * @public
 */
export const toPromise = <A>(values: E.Either<Error, A>): Promise<A> =>
	F.pipe(
		values,
		E.fold(
			(error) => Promise.reject(error),
			(result) => Promise.resolve(result),
		),
	);
