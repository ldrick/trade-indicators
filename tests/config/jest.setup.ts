import { Big } from 'big.js';
import { either as E, function as F } from 'fp-ts/lib';
import { diff, DiffOptions } from 'jest-diff';
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { ReadonlyRecordBig, ReadonlyRecordNumber } from '../../src/types';

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
  received: E.Either<E, ReadonlyArray<Big> | ReadonlyRecordBig>,
  expected: ReadonlyArray<number> | ReadonlyRecordNumber,
  decimals = 12,
) => {
  const formatNumberArray = (
    arr: ReadonlyArray<number> | ReadonlyArray<Big>,
    dec: number,
  ): ReadonlyArray<string> => arr.map((el) => el.toFixed(dec));

  const formatReadonlyRecordNumber = (
    obj: ReadonlyRecordNumber | ReadonlyRecordBig,
    dec: number,
  ): FormattedObject =>
    Object.keys(obj).reduce(
      (reduced, key) => ({ ...reduced, ...{ [key]: formatNumberArray(obj[key], dec) } }),
      {},
    );

  const formatValues = (
    val: ReadonlyArray<number> | ReadonlyArray<Big> | ReadonlyRecordNumber | ReadonlyRecordBig,
    dec: number,
  ): ReadonlyArray<string> | FormattedObject =>
    val instanceof Array ? formatNumberArray(val, dec) : formatReadonlyRecordNumber(val, dec);

  const compareArrays = (exp: ReadonlyArray<number>, rec: ReadonlyArray<Big>): boolean =>
    exp.length === rec.length &&
    exp.every((e, index) => e.toFixed(decimals) === rec[index].toFixed(decimals));

  const compareObjects = (exp: ReadonlyRecordNumber, rec: ReadonlyRecordBig): boolean =>
    Object.keys(exp).every((k) => compareArrays(exp[k], rec[k]));

  return {
    pass: F.pipe(
      received,
      E.fold(
        () => false,
        (right) =>
          expected instanceof Array && right instanceof Array
            ? compareArrays(expected, right)
            : compareObjects(expected as ReadonlyRecordNumber, right as ReadonlyRecordBig),
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
