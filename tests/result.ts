import { type Result } from '../src/types.js';

/**
Expected failed `Result`.
 */
export const failure = <E extends Error>(error: E): Result<never, E> => ({ error, ok: false });

/**
Expected successful `Result`.
 */
export const success = <A>(value: A): Result<A, never> => ({ ok: true, value });

type Series = readonly (null | number)[];

/**
 * Expected indicator output aligned to the input length: left-padded with `null`.
 * Fixtures and hand-calculated values list only the calculated values.
 */
export const aligned = <T extends Readonly<Record<string, Series>> | Series>(
	expected: T,
	length: number,
): T => {
	const pad = (series: Series): Series => [
		...Array.from({ length: length - series.length }, () => null),
		...series,
	];
	return (
		Array.isArray(expected)
			? pad(expected as Series)
			: Object.fromEntries(
					Object.entries(expected as Readonly<Record<string, Series>>).map(
						([key, series]) => [key, pad(series)],
					),
				)
	) as T;
};
