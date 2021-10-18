import { NotEnoughDataError, NotPositiveIntegerError } from '@src/errors';
import { tema } from '@src/index';
import { either as E } from 'fp-ts/lib';
import * as prices from '../prices.json';

describe('tema', () => {
  test.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
    'fails if period is not a positive integer $p',
    ({ p }) => {
      expect(tema([], p)).toStrictEqual(E.left(new NotPositiveIntegerError()));
    },
  );

  it('fails if not enough data to calculate for period', () => {
    expect(tema([1, 2, 3, 4, 5, 6], 3)).toStrictEqual(E.left(new NotEnoughDataError(6, 7)));
  });

  test.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
    'fails if values contains a infinit value $v',
    ({ v }) => {
      expect(tema(v, 2)).toStrictEqual(E.left(new Error('[big.js] Invalid number')));
    },
  );

  it('calculates the Triple Exponential Moving Average with default period', () => {
    expect(tema(prices.close)).eitherRightToEqualFixedPrecision(prices.tema.p20);
  });

  test.each([
    { v: [0, 0, 0, 0, 0, 0, 0], p: 3, r: [0] },
    { v: prices.close, p: 10, r: prices.tema.p10 },
    { v: prices.close, p: 20, r: prices.tema.p20 },
  ])('calculates the Triple Exponential Moving Average with period %p', ({ v, p, r }) => {
    expect(tema(v, p)).eitherRightToEqualFixedPrecision(r);
  });
});
