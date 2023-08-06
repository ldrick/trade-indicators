import { either as E, function as F } from 'fp-ts/lib';

/**
 * Provides a way to transform Either to Promise.
 * @public
 */
// eslint-disable-next-line functional/prefer-immutable-types
export const toPromise = <A>(values: E.Either<Error, A>): Promise<A> =>
	F.pipe(
		values,
		E.fold(
			(error) => Promise.reject(error),
			(result) => Promise.resolve(result),
		),
	);
