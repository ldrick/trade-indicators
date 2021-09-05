import Big from 'big.js';
import { either as E, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { max, numberToBig } from '../../src/utils';
import { ord } from '../../src/utils/big';

describe('ord.compare', () => {
  test.each([
    { f: new Big(-1), s: new Big(-2), r: 1 },
    { f: new Big(0), s: new Big(0), r: 0 },
    { f: new Big(-1), s: new Big(2), r: -1 },
  ])('fp-ts Ord compares two Big $f and $s', ({ f, s, r }) => {
    expect(ord.compare(f, s)).toStrictEqual(r);
  });
});

describe('ord.equals', () => {
  test.each([
    { f: new Big(-1), s: new Big(-2), r: false },
    { f: new Big(0), s: new Big(0), r: true },
    { f: new Big(-1), s: new Big(2), r: false },
  ])('fp-ts Ord compares two Big $f and $s', ({ f, s, r }) => {
    expect(ord.equals(f, s)).toStrictEqual(r);
  });
});

describe('max', () => {
  test.each<{
    v: RNEA.ReadonlyNonEmptyArray<Big>;
    r: Big;
  }>([
    { v: [new Big(-1)], r: new Big(-1) },
    { v: [new Big(0)], r: new Big(0) },
    { v: [new Big(1), new Big(1), new Big(2)], r: new Big(2) },
  ])('returns the maximum value of $v', ({ v, r }) => {
    expect(max(v)).toStrictEqual(r);
  });
});

describe('numberToBig', () => {
  test.each([
    { v: 1, r: E.right(new Big(1)) },
    { v: 1.0000333, r: E.right(new Big(1.0000333)) },
    { v: 0, r: E.right(new Big(0)) },
    { v: -4988383.99, r: E.right(new Big(-4988383.99)) },
    { v: NaN, r: E.left(new Error('[big.js] Invalid number')) },
    { v: Infinity, r: E.left(new Error('[big.js] Invalid number')) },
    { v: -Infinity, r: E.left(new Error('[big.js] Invalid number')) },
  ])('safely convert number to Big $v', ({ v, r }) => {
    expect(numberToBig(v)).toStrictEqual(r);
  });
});
