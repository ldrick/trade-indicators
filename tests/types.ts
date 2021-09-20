import { readonlyRecord as RR } from 'fp-ts';

export type JestResultArray = ReadonlyArray<number | null>;
export type JestResultRecord = RR.ReadonlyRecord<string, JestResultArray>;
export type JestResult = JestResultArray | JestResultRecord;
