import { NotEnoughDataError, NotPositiveIntegerError } from '@src/errors';
import { sma } from '@src/index';
import { either as E } from 'fp-ts/lib';
import * as prices from '../prices.json';

describe('sma', () => {
  test.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
    'fails if period is not a positive integer $p',
    ({ p }) => {
      expect(sma([1], p)).toStrictEqual(E.left(new NotPositiveIntegerError()));
    },
  );

  it('fails if not enough data to calculate for period', () => {
    expect(sma([1, 2], 3)).toStrictEqual(E.left(new NotEnoughDataError(2, 3)));
  });

  test.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
    'fails if values contains a infinit value $v',
    ({ v }) => {
      expect(sma(v, 2)).toStrictEqual(E.left(new Error('[big.js] Invalid number')));
    },
  );

  it('calculates the Simple Moving Average with default period', () => {
    expect(sma(prices.close)).eitherRightToEqualFixedPrecision(prices.sma.p20);
  });

  test.each([
    { v: [0, 0, 0], p: 3, r: [0] },
    { v: prices.close, p: 10, r: prices.sma.p10 },
    { v: prices.close, p: 20, r: prices.sma.p20 },
  ])('calculates the Simple Moving Average with period $p', ({ v, p, r }) => {
    expect(sma(v, p)).eitherRightToEqualFixedPrecision(r);
  });
});
