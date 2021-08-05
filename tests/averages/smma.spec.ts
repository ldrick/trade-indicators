import { either as E } from 'fp-ts/lib';
import { smma } from '../../src';
import { InfinitNumberError, NotEnoughDataError, NotPositiveIntegerError } from '../../src/errors';
import * as prices from '../prices.json';

describe('smma', () => {
  test.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
    'fails if period is not a positive integer $p',
    ({ p }) => {
      expect(smma([], p)).toStrictEqual(E.left(new NotPositiveIntegerError('period')));
    },
  );

  it('fails if not enough data to calculate for period', () => {
    expect(smma([1, 2], 3)).toStrictEqual(E.left(new NotEnoughDataError(3, 3)));
  });

  test.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
    'fails if values contains a infinit value $v',
    ({ v }) => {
      expect(smma(v, 2)).toStrictEqual(E.left(new InfinitNumberError()));
    },
  );

  it('calculates the Smoothed Moving Average with default period', () => {
    expect(smma(prices.close)).eitherRightToEqualFixedPrecision(prices.smma.p20);
  });

  test.each([
    { v: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], p: 3, r: [0, 0, 0, 0, 0, 0, 0, 0] },
    { v: prices.close, p: 10, r: prices.smma.p10 },
    { v: prices.close, p: 20, r: prices.smma.p20 },
  ])('calculates the Smoothed Moving Average with period $p', ({ v, p, r }) => {
    expect(smma(v, p)).eitherRightToEqualFixedPrecision(r);
  });
});
