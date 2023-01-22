import { readonlyNonEmptyArray as RNEA, readonlyRecord as RR } from 'fp-ts';

// record array
export type ReadonlyRecordArray<A> = RR.ReadonlyRecord<string, ReadonlyArray<A>>;
export type HighLowClose<A> = ReadonlyRecordArray<A> & {
	high: ReadonlyArray<A>;
	low: ReadonlyArray<A>;
	close: ReadonlyArray<A>;
};

export type NonEmpty<A, Type extends ReadonlyRecordArray<A>> = {
	[Property in keyof Type]: RNEA.ReadonlyNonEmptyArray<A>;
};

// non empty record array
export type ReadonlyRecordNonEmptyArray<A> = NonEmpty<A, ReadonlyRecordArray<A>>;
export type NonEmptyHighLowClose<A> = NonEmpty<A, HighLowClose<A>>;
