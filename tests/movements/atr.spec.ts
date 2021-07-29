import { left } from 'fp-ts/lib/Either';
import { atr } from '../../src';
import {
  InfinitNumberError,
  NotEnoughDataError,
  NotPositiveIntegerError,
  UnequalArraySizesError,
} from '../../src/errors';
import * as prices from '../prices.json';

describe('atr', () => {
  test.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
    'fails if period is not a positive integer $p',
    ({ p }) => {
      expect(atr({ close: [1.3], high: [1.5], low: [0.9] }, p)).toStrictEqual(
        left(new NotPositiveIntegerError('period')),
      );
    },
  );

  it('fails if not enough data to calculate for period', () => {
    expect(atr({ close: [1.3], high: [1.5], low: [0.9] }, 3)).toStrictEqual(
      left(new NotEnoughDataError(3, 4)),
    );
  });

  it('fails if data given has unequal sizes', () => {
    expect(
      atr({ close: [1.3, 2.1, 2, 3, 1.9], high: [1.5, 2.4, 2.8, 2.3], low: [0.9, 1.5, 2.3] }, 1),
    ).toStrictEqual(left(new UnequalArraySizesError()));
  });

  test.each([
    {
      v: {
        high: [0, 0, NaN, 0],
        low: [0, 0, 0, 0],
        close: [0, 0, 0, 0],
      },
    },
    {
      v: {
        high: [0, 0, 0, 0],
        low: [0, 0, Infinity, 0],
        close: [0, 0, 0, 0],
      },
    },
    {
      v: {
        high: [0, 0, 0, 0],
        low: [0, 0, 0, 0],
        close: [0, -Infinity, 0, 0],
      },
    },
  ])('fails if any value is a infinit value $v', ({ v }) => {
    expect(atr(v, 2)).toStrictEqual(left(new InfinitNumberError()));
  });

  it('calculates the Average True Range with default period', () => {
    expect(
      atr({ high: prices.high, low: prices.low, close: prices.close }),
    ).eitherRightToEqualFixedPrecision(prices.atr.p14);
  });

  test.each([
    {
      v: {
        high: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        low: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        close: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      p: 3,
      r: [0, 0, 0, 0, 0, 0, 0],
    },
    { v: { high: prices.high, low: prices.low, close: prices.close }, p: 14, r: prices.atr.p14 },
  ])('calculates the Average True Range on prices with period $p', ({ v, p, r }) => {
    expect(atr(v, p)).eitherRightToEqualFixedPrecision(r);
  });
});
