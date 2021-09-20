import { either as E } from 'fp-ts/lib';
import { dema } from '../../src';
import { NotEnoughDataError, NotPositiveIntegerError } from '../../src/errors';
import * as prices from '../prices.json';

describe('dema', () => {
  test.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
    'fails if period is not a positive integer $p',
    ({ p }) => {
      expect(dema([], p)).toStrictEqual(E.left(new NotPositiveIntegerError()));
    },
  );

  it('fails if not enough data to calculate for period', () => {
    expect(dema([1, 2, 3, 4], 3)).toStrictEqual(E.left(new NotEnoughDataError(4, 5)));
  });

  test.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
    'fails if values contains a infinit value $v',
    ({ v }) => {
      expect(dema(v, 2)).toStrictEqual(E.left(new Error('[big.js] Invalid number')));
    },
  );

  it('calculates the Double Exponential Moving Average with default period', () => {
    expect(dema(prices.close)).eitherRightToEqualFixedPrecision(prices.dema.p20);
  });

  test.each([
    { v: [0, 0, 0, 0, 0], p: 3, r: [0] },
    { v: prices.close, p: 10, r: prices.dema.p10 },
    { v: prices.close, p: 20, r: prices.dema.p20 },
  ])('calculates the Double Exponential Moving Average with period $p', ({ v, p, r }) => {
    expect(dema(v, p)).eitherRightToEqualFixedPrecision(r);
  });
});
