import { adx, NotEnoughDataError, UnequalArraySizesError } from '../../src';
import * as prices from '../prices.json';

describe('adx', () => {
  it('throws if not enough data to calculate for period', () => {
    expect(() => adx({ close: [1.3], high: [1.5], low: [0.9] }, 3)).toThrowError(
      NotEnoughDataError,
    );
  });

  it('throws if data given has unequal sizes', () => {
    expect(() =>
      adx({ close: [1.3, 2.1, 2, 3, 1.9], high: [1.5, 2.4, 2.8, 2.3], low: [0.9, 1.5, 2.3] }, 1),
    ).toThrowError(UnequalArraySizesError);
  });

  it('calculates the Average Directional Index on prices with period 14', () => {
    expect(
      adx({ high: prices.high, low: prices.low, close: prices.close }, 14),
    ).toEqualFixedPrecision(prices.adx.p14);
  });
});
