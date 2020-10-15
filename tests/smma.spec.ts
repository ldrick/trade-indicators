import { NotEnoughDataError, smma } from '../src';
import * as prices from './prices.json';

describe('smma', () => {
  it('throws if period is above data length', () => {
    expect(() => smma([1, 2], 3)).toThrowError(NotEnoughDataError);
  });

  test.each([
    [10, prices.smma.p10],
    [20, prices.smma.p20],
  ])('calculates the Smoothed Moving Average with period %p', (period, results) => {
    const outcome = smma(prices.close, period).map((value) => value.toFixed(8));
    const expected = results.map((value) => value.toFixed(8));
    expect(outcome).toEqual(expected);
  });
});
