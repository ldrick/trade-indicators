import { either as E } from 'fp-ts/lib';
import { adx } from '../../src';
import {
  InfinitNumberError,
  NotEnoughDataError,
  NotPositiveIntegerError,
  UnequalArraySizesError,
} from '../../src/errors';
import * as prices from '../prices.json';

describe('adx', () => {
  test.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
    'fails if period is not a positive integer $p',
    ({ p }) => {
      expect(adx({ close: [1.3], high: [1.5], low: [0.9] }, p)).toStrictEqual(
        E.left(new NotPositiveIntegerError('period')),
      );
    },
  );

  it('fails if not enough data to calculate for period', () => {
    expect(
      adx({ close: [1, 2, 3, 4, 5], high: [1, 2, 3, 4, 5], low: [1, 2, 3, 4, 5] }, 3),
    ).toStrictEqual(E.left(new NotEnoughDataError(3, 6)));
  });

  it('fails if data given has unequal sizes', () => {
    expect(
      adx({ close: [1.3, 2.1, 2, 3, 1.9], high: [1.5, 2.4, 2.8, 2.3], low: [0.9, 1.5, 2.3] }, 1),
    ).toStrictEqual(E.left(new UnequalArraySizesError()));
  });

  test.each([
    {
      v: {
        high: [0, 0, NaN, 0, 0],
        low: [0, 0, 0, 0, 0],
        close: [0, 0, 0, 0, 0],
      },
    },
    {
      v: {
        high: [0, 0, 0, 0, 0],
        low: [0, 0, Infinity, 0, 0],
        close: [0, 0, 0, 0, 0],
      },
    },
    {
      v: {
        high: [0, 0, 0, 0, 0],
        low: [0, 0, 0, 0, 0],
        close: [0, -Infinity, 0, 0, 0],
      },
    },
  ])('fails if any value is a infinit value $v', ({ v }) => {
    expect(adx(v, 2)).toStrictEqual(E.left(new InfinitNumberError()));
  });

  it('calculates the Average Directional Index with default period', () => {
    expect(
      adx({ high: prices.high, low: prices.low, close: prices.close }),
    ).eitherRightToEqualFixedPrecision(prices.adx.p14);
  });

  test.each([
    {
      v: {
        high: [0, 0, 0, 0, 0, 0],
        low: [0, 0, 0, 0, 0, 0],
        close: [0, 0, 0, 0, 0, 0],
      },
      p: 3,
      r: { adx: [0], mdi: [0], pdi: [0] },
    },
    { v: { high: prices.high, low: prices.low, close: prices.close }, p: 14, r: prices.adx.p14 },
  ])('calculates the Average Directional Index on prices with period $p', ({ v, p, r }) => {
    expect(adx(v, p)).eitherRightToEqualFixedPrecision(r);
  });
});
