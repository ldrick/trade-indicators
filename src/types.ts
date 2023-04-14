import { readonlyNonEmptyArray as RNEA, readonlyRecord as RR } from 'fp-ts';

// record array
export type ReadonlyRecordArray<A> = RR.ReadonlyRecord<Readonly<string>, ReadonlyArray<A>>;
export type HighLowClose<A> = ReadonlyRecordArray<A> & {
	readonly high: ReadonlyArray<A>;
	readonly low: ReadonlyArray<A>;
	readonly close: ReadonlyArray<A>;
};

export type NonEmpty<A, Type extends ReadonlyRecordArray<A>> = {
	readonly [Property in keyof Type]: RNEA.ReadonlyNonEmptyArray<A>;
};

// non empty record array
export type ReadonlyRecordNonEmptyArray<A> = NonEmpty<A, ReadonlyRecordArray<A>>;
export type NonEmptyHighLowClose<A> = NonEmpty<A, HighLowClose<A>>;
