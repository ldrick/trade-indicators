import { NotEnoughDataError, tema } from '../../src';
import * as prices from '../prices.json';

describe('tema', () => {
  it('throws if not enough data to calculate for period', () => {
    expect(() => tema([1, 2], 3)).toThrowError(NotEnoughDataError);
  });

  test.each([
    [10, prices.tema.p10],
    [20, prices.tema.p20],
  ])('calculates the Triple Exponential Moving Average with period %p', (period, results) => {
    expect(tema(prices.close, period)).toEqualFixedPrecision(results);
  });
});
