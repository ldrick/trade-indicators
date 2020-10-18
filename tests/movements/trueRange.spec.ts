import { trueRange } from '../../src/movements/trueRange';
import * as prices from '../prices.json';

describe('trueRange', () => {
  it('calculates the true range on prices', () => {
    const outcome = trueRange({
      high: prices.high,
      low: prices.low,
      close: prices.close,
    }).map((value) => value.toFixed(8));
    const expected = prices.trange.map((value) => value.toFixed(8));

    expect(outcome).toEqual(expected);
  });
});
