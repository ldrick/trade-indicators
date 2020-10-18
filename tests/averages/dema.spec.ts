import { dema, NotEnoughDataError } from '../../src';
import * as prices from '../prices.json';

describe('dema', () => {
  it('throws if period is to big for data length', () => {
    expect(() => dema([1, 2], 3)).toThrowError(NotEnoughDataError);
  });

  test.each([
    [10, prices.dema.p10],
    [20, prices.dema.p20],
  ])('calculates the Double Exponential Moving Average with period %p', (period, results) => {
    const outcome = dema(prices.close, period).map((value) => value.toFixed(8));
    const expected = results.map((value) => value.toFixed(8));
    expect(outcome).toEqual(expected);
  });
});
