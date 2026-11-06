import { readonlyNonEmptyArray as RNEA } from 'fp-ts';

/**
 * Price series of high, low and close values, all of the same length.
 * @public
 */
export interface HighLowClose<A> {
	readonly close: readonly A[];
	readonly high: readonly A[];
	readonly low: readonly A[];
}

/**
 * `HighLowClose` with non-empty arrays.
 * @internal
 */
export type NonEmptyHighLowClose<A> = {
	readonly [Property in keyof HighLowClose<A>]: RNEA.ReadonlyNonEmptyArray<A>;
};
