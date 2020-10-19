import { ema, NotEnoughDataError } from '../../src';
import * as prices from '../prices.json';

describe('ema', () => {
  it('throws if not enough data to calculate for period', () => {
    expect(() => ema([1, 2], 3)).toThrowError(NotEnoughDataError);
  });

  test.each([
    [10, prices.ema.p10],
    [20, prices.ema.p20],
  ])('calculates the Exponential Moving Average with period %p', (period, results) => {
    expect(ema(prices.close, period)).toEqualFixedPrecision(results);
  });
});
