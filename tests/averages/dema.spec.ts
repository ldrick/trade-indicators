import { dema, NotEnoughDataError } from '../../src';
import * as prices from '../prices.json';

describe('dema', () => {
  it('throws if not enough data to calculate for period', () => {
    expect(() => dema([1, 2], 3)).toThrowError(NotEnoughDataError);
  });

  test.each([
    [10, prices.dema.p10],
    [20, prices.dema.p20],
  ])('calculates the Double Exponential Moving Average with period %p', (period, results) => {
    expect(dema(prices.close, period)).toEqualFixedPrecision(results);
  });
});
