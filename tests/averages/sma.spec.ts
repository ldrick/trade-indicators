import { NotEnoughDataError, sma } from '../../src';
import * as prices from '../prices.json';

describe('sma', () => {
  it('throws if not enough data to calculate for period', () => {
    expect(() => sma([1, 2], 3)).toThrowError(NotEnoughDataError);
  });

  test.each([
    [10, prices.sma.p10],
    [20, prices.sma.p20],
  ])('calculates the Simple Moving Average with period %p', (period, results) => {
    const outcome = sma(prices.close, period).map((value) => value.toFixed(8));
    const expected = results.map((value) => value.toFixed(8));
    expect(outcome).toEqual(expected);
  });
});
