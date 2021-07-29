import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib/';
import { pipe } from 'fp-ts/lib/function';
import { diff, DiffOptions } from 'jest-diff';
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { BigObject, NumberObject } from '../../src/types';

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
  received: E.Either<E, readonly Big[] | BigObject>,
  expected: readonly number[] | NumberObject,
  decimals = 12,
) => {
  const formatNumberArray = (
    arr: readonly number[] | readonly Big[],
    dec: number,
  ): readonly string[] => arr.map((el) => el.toFixed(dec));

  const formatNumberObject = (obj: NumberObject | BigObject, dec: number): FormattedObject =>
    Object.keys(obj).reduce(
      (reduced, key) => ({ ...reduced, ...{ [key]: formatNumberArray(obj[key], dec) } }),
      {},
    );

  const formatValues = (
    val: readonly number[] | readonly Big[] | NumberObject | BigObject,
    dec: number,
  ): readonly string[] | FormattedObject =>
    val instanceof Array ? formatNumberArray(val, dec) : formatNumberObject(val, dec);

  const compareArrays = (exp: readonly number[], rec: readonly Big[]): boolean =>
    exp.length === rec.length &&
    exp.every((e, index) => e.toFixed(decimals) === rec[index].toFixed(decimals));

  const compareObjects = (exp: NumberObject, rec: BigObject): boolean =>
    Object.keys(exp).every((k) => compareArrays(exp[k], rec[k]));

  return {
    pass: pipe(
      received,
      E.fold(
        () => false,
        (right) =>
          expected instanceof Array && right instanceof Array
            ? compareArrays(expected, right)
            : compareObjects(expected as NumberObject, right as BigObject),
      ),
    ),
    message: () =>
      pipe(
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
