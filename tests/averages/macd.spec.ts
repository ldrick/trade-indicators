import { NotEnoughDataError, NotPositiveIntegerError, PeriodSizeMissmatchError } from '@src/errors';
import { macd } from '@src/index';
import { either as E } from 'fp-ts/lib';
import * as prices from '../prices.json';

describe('macd', () => {
  test.each([
    { p: [NaN] },
    { p: [1, NaN] },
    { p: [1, 1, NaN] },
    { p: [Infinity] },
    { p: [1, Infinity] },
    { p: [1, 1, Infinity] },
    { p: [-Infinity] },
    { p: [1, -Infinity] },
    { p: [1, 1, -Infinity] },
    { p: [0] },
    { p: [1, 0] },
    { p: [1, 1, 0] },
    { p: [-1] },
    { p: [1, -1] },
    { p: [1, 1, -1] },
    { p: [1.5] },
    { p: [1, 1.5] },
    { p: [1, 1, 1.5] },
  ])('fails if any period is not a positive integer $p', ({ p }) => {
    expect(macd([], ...p)).toStrictEqual(E.left(new NotPositiveIntegerError()));
  });

  it('fails if slowPeriod is lower or equal fastPeriod', () => {
    expect(macd([], 3, 1)).toStrictEqual(
      E.left(new PeriodSizeMissmatchError('slowPeriod', 'fastPeriod')),
    );
  });

  it('fails if not enough data to calculate for periods', () => {
    expect(macd([1, 2, 3, 4], 3, 4, 2)).toStrictEqual(E.left(new NotEnoughDataError(4, 5)));
  });

  test.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
    'fails if values contains a infinit value $v',
    ({ v }) => {
      expect(macd(v, 2, 3, 1)).toStrictEqual(E.left(new Error('[big.js] Invalid number')));
    },
  );

  it('calculates the Moving Average Convergence / Divergence with default period', () => {
    expect(macd(prices.close)).eitherRightToEqualFixedPrecision(prices.macd);
  });

  test.each([
    {
      v: [0, 0, 0, 0, 0],
      p: [3, 4, 2],
      r: { macd: [0, 0], signal: [null, 0] },
    },
    { v: prices.close, p: [12, 26, 9], r: prices.macd },
  ])(
    'calculates the Moving Average Convergence / Divergence on prices in test $#',
    ({ v, p, r }) => {
      expect(macd(v, ...p)).eitherRightToEqualFixedPrecision(r);
    },
  );
});
