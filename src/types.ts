import { readonlyNonEmptyArray as RNEA, readonlyRecord as RR } from 'fp-ts';

// record array
export type ReadonlyRecordArray<A> = RR.ReadonlyRecord<Readonly<string>, readonly A[]>;
export type HighLowClose<A> = ReadonlyRecordArray<A> & {
	readonly high: readonly A[];
	readonly low: readonly A[];
	readonly close: readonly A[];
};

export type NonEmpty<A, Type extends ReadonlyRecordArray<A>> = {
	readonly [Property in keyof Type]: RNEA.ReadonlyNonEmptyArray<A>;
};

// non empty record array
export type ReadonlyRecordNonEmptyArray<A> = NonEmpty<A, ReadonlyRecordArray<A>>;
export type NonEmptyHighLowClose<A> = NonEmpty<A, HighLowClose<A>>;
