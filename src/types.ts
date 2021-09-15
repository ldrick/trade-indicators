import { Big } from 'big.js';
import { readonlyNonEmptyArray as RNEA, readonlyRecord as RR } from 'fp-ts';

export type Movement = 'up' | 'down';

// number records
export type ReadonlyRecordNumber = RR.ReadonlyRecord<string, ReadonlyArray<number>>;
export type ReadonlyNonEmptyRecordNumber = RR.ReadonlyRecord<
  string,
  RNEA.ReadonlyNonEmptyArray<number>
>;

// Big records
export type ReadonlyRecordBig = RR.ReadonlyRecord<string, ReadonlyArray<Big>>;
export type ReadonlyNonEmptyRecordBig = RR.ReadonlyRecord<string, RNEA.ReadonlyNonEmptyArray<Big>>;

// value union types
export type ReadonlyValuesNumber = ReadonlyArray<number> | ReadonlyRecordNumber;
export type ReadonlyNonEmptyValuesNumber =
  | RNEA.ReadonlyNonEmptyArray<number>
  | ReadonlyNonEmptyRecordNumber;

// High-Low-Close records
export type ReadonlyHighLowCloseNumber = ReadonlyRecordNumber & {
  high: ReadonlyArray<number>;
  low: ReadonlyArray<number>;
  close: ReadonlyArray<number>;
};
export type ReadonlyNonEmptyHighLowCloseNumber = ReadonlyNonEmptyRecordNumber & {
  high: RNEA.ReadonlyNonEmptyArray<number>;
  low: RNEA.ReadonlyNonEmptyArray<number>;
  close: RNEA.ReadonlyNonEmptyArray<number>;
};
export type ReadonlyHighLowCloseBig = ReadonlyRecordBig & {
  high: ReadonlyArray<Big>;
  low: ReadonlyArray<Big>;
  close: ReadonlyArray<Big>;
};
export type ReadonlyNonEmptyHighLowCloseBig = ReadonlyNonEmptyRecordBig & {
  high: RNEA.ReadonlyNonEmptyArray<Big>;
  low: RNEA.ReadonlyNonEmptyArray<Big>;
  close: RNEA.ReadonlyNonEmptyArray<Big>;
};

// needed for Tests
export type JestResultArray = ReadonlyArray<number | null>;
export type JestResultRecord = RR.ReadonlyRecord<string, JestResultArray>;
export type JestResult = JestResultArray | JestResultRecord;
