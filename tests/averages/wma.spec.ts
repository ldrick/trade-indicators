import { NotEnoughDataError, wma } from '../../src';
import * as prices from '../prices.json';

describe('wma', () => {
  it('throws if not enough data to calculate for period', () => {
    expect(() => wma([1, 2], 3)).toThrowError(NotEnoughDataError);
  });

  test.each([
    [10, prices.wma.p10],
    [20, prices.wma.p20],
  ])('calculates the Weighted Moving Average with period %p', (period, results) => {
    expect(wma(prices.close, period)).toEqualFixedPrecision(results);
  });
});
