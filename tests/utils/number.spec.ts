import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';
import { num } from '../../src/utils';

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
    expect(num.toBig(v)).toStrictEqual(r);
  });
});
