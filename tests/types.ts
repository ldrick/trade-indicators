import { readonlyRecord as RR } from 'fp-ts';

export type TestResultArray = ReadonlyArray<number | null>;
export type TestResultRecord = RR.ReadonlyRecord<string, TestResultArray>;
export type TestResult = TestResultArray | TestResultRecord;

export type FormattedArray = ReadonlyArray<string>;
export type FormattedRecord = Readonly<Record<string, FormattedArray>>;
