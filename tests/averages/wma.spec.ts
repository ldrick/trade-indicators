import { NotEnoughDataError, wma } from '../../src';
import * as prices from '../prices.json';

describe('wma', () => {
  it('throws if period is to big for data length', () => {
    expect(() => wma([1, 2], 3)).toThrowError(NotEnoughDataError);
  });

  test.each([
    [10, prices.wma.p10],
    [20, prices.wma.p20],
  ])('calculates the Weighted Moving Average with period %p', (period, results) => {
    const outcome = wma(prices.close, period).map((value) => value.toFixed(8));
    const expected = results.map((value) => value.toFixed(8));
    expect(outcome).toEqual(expected);
  });
});
