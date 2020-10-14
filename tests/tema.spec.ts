import { NotEnoughDataError, tema } from '../src';
import * as prices from './prices.json';

describe('tema', () => {
  it('throws if period is to big for data length', () => {
    expect(() => tema([1, 2], 3)).toThrowError(NotEnoughDataError);
  });

  test.each([
    [10, prices.tema.p10],
    [20, prices.tema.p20],
  ])('calculates the Triple Exponential Moving Average with period %p', (period, results) => {
    const outcome = tema(prices.close, period).map((value) => value.toFixed(8));
    const expected = results.map((value) => value.toFixed(8));
    expect(outcome).toEqual(expected);
  });
});
