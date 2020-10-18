import { atr } from '../../src/movements/atr';
import * as prices from '../prices.json';

describe('atr', () => {
  it('calculates the average true range on prices with period 14', () => {
    const outcome = atr(
      { high: prices.high, low: prices.low, close: prices.close },
      14,
    ).map((value) => value.toFixed(8));
    const expected = prices.atr.p14.map((value) => value.toFixed(8));

    expect(outcome).toEqual(expected);
  });
});
