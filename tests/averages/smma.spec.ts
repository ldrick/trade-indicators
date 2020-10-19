import { NotEnoughDataError, smma } from '../../src';
import * as prices from '../prices.json';

describe('smma', () => {
  it('throws if not enough data to calculate for period', () => {
    expect(() => smma([1, 2], 3)).toThrowError(NotEnoughDataError);
  });

  test.each([
    [10, prices.smma.p10],
    [20, prices.smma.p20],
  ])('calculates the Smoothed Moving Average with period %p', (period, results) => {
    expect(smma(prices.close, period)).toEqualFixedPrecision(results);
  });
});
