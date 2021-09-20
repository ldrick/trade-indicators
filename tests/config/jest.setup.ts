import { either as E, function as F } from 'fp-ts/lib';
import { diff, DiffOptions } from 'jest-diff';
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { JestResult, JestResultArray, JestResultRecord } from '../types';

type FormattedObject = { [x: string]: string };

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

const eitherRightToEqualFixedPrecision = <E>(
  received: E.Either<E, JestResult>,
  expected: JestResult,
  decimals = 12,
) => {
  const formatNumberArray = (arr: JestResultArray, dec: number): ReadonlyArray<string> =>
    arr.map((el) => (el === null ? String(el) : el.toFixed(dec)));

  const formatReadonlyRecordNumber = (obj: JestResultRecord, dec: number): FormattedObject =>
    Object.keys(obj).reduce(
      (reduced, key) => ({ ...reduced, ...{ [key]: formatNumberArray(obj[key], dec) } }),
      {},
    );

  const formatValues = (val: JestResult, dec: number): ReadonlyArray<string> | FormattedObject =>
    val instanceof Array ? formatNumberArray(val, dec) : formatReadonlyRecordNumber(val, dec);

  const compareArrays = (exp: JestResultArray, rec: JestResultArray): boolean =>
    exp.length === rec.length &&
    exp.every((e, index) => {
      const left = e === null ? e : e.toFixed(decimals);
      const r = rec[index];
      const right = r === null ? r : r.toFixed(decimals);
      return left === right;
    });

  const compareObjects = (exp: JestResultRecord, rec: JestResultRecord): boolean =>
    Object.keys(exp).every((k) => compareArrays(exp[k], rec[k]));

  return {
    pass: F.pipe(
      received,
      E.fold(
        () => false,
        (right) =>
          expected instanceof Array && right instanceof Array
            ? compareArrays(expected, right)
            : compareObjects(expected as JestResultRecord, right as JestResultRecord),
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
              formatValues(rec, decimals),
              formatValues(expected, decimals),
            ),
        ),
      ),
  };
};

expect.extend({
  eitherRightToEqualFixedPrecision,
});
