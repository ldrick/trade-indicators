import { readonlyNonEmptyArray as RNEA } from 'fp-ts';

export interface HighLowClose<A> {
	readonly close: readonly A[];
	readonly high: readonly A[];
	readonly low: readonly A[];
}

export type NonEmptyHighLowClose<A> = {
	readonly [Property in keyof HighLowClose<A>]: RNEA.ReadonlyNonEmptyArray<A>;
};
