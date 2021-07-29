import { left } from 'fp-ts/lib/Either';
import { dema } from '../../src';
import { InfinitNumberError, NotEnoughDataError, NotPositiveIntegerError } from '../../src/errors';
import * as prices from '../prices.json';

describe('dema', () => {
  test.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
    'fails if period is not a positive integer $p',
    ({ p }) => {
      expect(dema([], p)).toStrictEqual(left(new NotPositiveIntegerError('period')));
    },
  );

  it('fails if not enough data to calculate for period', () => {
    expect(dema([1, 2], 3)).toStrictEqual(left(new NotEnoughDataError(3, 5)));
  });

  test.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
    'fails if values contains a infinit value $v',
    ({ v }) => {
      expect(dema(v, 2)).toStrictEqual(left(new InfinitNumberError()));
    },
  );

  it('calculates the Double Exponential Moving Average with default period', () => {
    expect(dema(prices.close)).eitherRightToEqualFixedPrecision(prices.dema.p20);
  });

  test.each([
    { v: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], p: 3, r: [0, 0, 0, 0, 0, 0] },
    { v: prices.close, p: 10, r: prices.dema.p10 },
    { v: prices.close, p: 20, r: prices.dema.p20 },
  ])('calculates the Double Exponential Moving Average with period $p', ({ v, p, r }) => {
    expect(dema(v, p)).eitherRightToEqualFixedPrecision(r);
  });
});
