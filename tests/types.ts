export type FormattedArray = readonly string[];
export type FormattedRecord = Readonly<Record<string, FormattedArray>>;
export type TestResult = TestResultArray | TestResultRecord;

export type TestResultArray = readonly (null | number)[];
export type TestResultRecord = Readonly<Record<string, TestResultArray>>;
