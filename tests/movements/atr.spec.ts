import { atr, NotEnoughDataError, UnequalArraySizesError } from '../../src';
import * as prices from '../prices.json';

describe('atr', () => {
  it('throws if not enough data to calculate for period', () => {
    expect(() => atr({ close: [1.3], high: [1.5], low: [0.9] }, 3)).toThrowError(
      NotEnoughDataError,
    );
  });

  it('throws if data given has unequal sizes', () => {
    expect(() =>
      atr({ close: [1.3, 2.1, 2, 3, 1.9], high: [1.5, 2.4, 2.8, 2.3], low: [0.9, 1.5, 2.3] }, 1),
    ).toThrowError(UnequalArraySizesError);
  });

  it('calculates the average true range on prices with period 14', () => {
    const outcome = atr(
      { high: prices.high, low: prices.low, close: prices.close },
      14,
    ).map((value) => value.toFixed(8));
    const expected = prices.atr.p14.map((value) => value.toFixed(8));

    expect(outcome).toEqual(expected);
  });
});
