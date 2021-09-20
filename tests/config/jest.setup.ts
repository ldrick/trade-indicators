import { either as E, function as F, readonlyArray as RA, readonlyRecord as RR } from 'fp-ts/lib';
import { diff, DiffOptions } from 'jest-diff';
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import {
  FormattedArray,
  FormattedRecord,
  JestResult,
  JestResultArray,
  JestResultRecord,
} from '../types';

const formatArray =
  (dec: number) =>
  (arr: JestResultArray): FormattedArray =>
    F.pipe(
      arr,
      RA.map((el) => (el === null ? String(el) : el.toFixed(dec))),
    );

const formatRecord =
  (dec: number) =>
  (rec: JestResultRecord): FormattedRecord =>
    F.pipe(rec, RR.map(formatArray(dec)));

const format =
  (dec: number) =>
  (val: JestResult): FormattedArray | FormattedRecord =>
    val instanceof Array ? formatArray(dec)(val) : formatRecord(dec)(val);

const formatDiff = <R, X>(
  matcherName: string,
  received: R,
  expected: X,
  options: DiffOptions = { expand: true },
) => {
  const diffString = diff(expected, received, options);
  return `${matcherHint(matcherName, undefined, undefined)}\n\n${
    diffString && diffString.includes('- Expect')
      ? `Difference:\n\n${diffString}`
      : `Expected: ${printExpected(expected)}\nReceived: ${printReceived(received)}`
  }`;
};

const compareArrays = <A>(exp: ReadonlyArray<A>, rec: ReadonlyArray<A>) =>
  exp.length === rec.length && exp.every((e, index) => e === rec[index]);

const compareResultArrays = (
  exp: JestResultArray,
  rec: JestResultArray,
  decimals: number,
): boolean =>
  exp.length === rec.length &&
  exp.every((e, index) => e?.toFixed(decimals) === rec[index]?.toFixed(decimals));

const compareResultRecords = (
  exp: JestResultRecord,
  rec: JestResultRecord,
  decimals: number,
): boolean =>
  compareArrays(Object.keys(exp), Object.keys(rec)) &&
  Object.keys(exp).every((k) => compareResultArrays(exp[k], rec[k], decimals));

const eitherRightToEqualFixedPrecision = <E>(
  received: E.Either<E, JestResult>,
  expected: JestResult,
  decimals = 12,
) => ({
  pass: F.pipe(
    received,
    E.fold(
      () => false,
      (right) =>
        expected instanceof Array && right instanceof Array
          ? compareResultArrays(expected, right, decimals)
          : compareResultRecords(expected as JestResultRecord, right as JestResultRecord, decimals),
    ),
  ),
  message: () =>
    F.pipe(
      received,
      E.fold(
        () => `Either expected to be right, but was left.`,
        (rec) =>
          formatDiff(
            '.eitherRightToEqualFixedPrecision',
            format(decimals)(rec),
            format(decimals)(expected),
          ),
      ),
    ),
});

expect.extend({
  eitherRightToEqualFixedPrecision,
});
