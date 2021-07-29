import { left } from 'fp-ts/lib/Either';
import { macd } from '../../src';
import {
  InfinitNumberError,
  NotEnoughDataError,
  NotPositiveIntegerError,
  PeriodSizeMissmatchError,
} from '../../src/errors';
import * as prices from '../prices.json';

describe('macd', () => {
  test.each([
    { p: [NaN], n: 'fastPeriod' },
    { p: [1, NaN], n: 'slowPeriod' },
    { p: [1, 1, NaN], n: 'signalPeriod' },
    { p: [Infinity], n: 'fastPeriod' },
    { p: [1, Infinity], n: 'slowPeriod' },
    { p: [1, 1, Infinity], n: 'signalPeriod' },
    { p: [-Infinity], n: 'fastPeriod' },
    { p: [1, -Infinity], n: 'slowPeriod' },
    { p: [1, 1, -Infinity], n: 'signalPeriod' },
    { p: [0], n: 'fastPeriod' },
    { p: [1, 0], n: 'slowPeriod' },
    { p: [1, 1, 0], n: 'signalPeriod' },
    { p: [-1], n: 'fastPeriod' },
    { p: [1, -1], n: 'slowPeriod' },
    { p: [1, 1, -1], n: 'signalPeriod' },
    { p: [1.5], n: 'fastPeriod' },
    { p: [1, 1.5], n: 'slowPeriod' },
    { p: [1, 1, 1.5], n: 'signalPeriod' },
  ])('fails if any period is not a positive integer $p', ({ p, n }) => {
    expect(macd([], ...p)).toStrictEqual(left(new NotPositiveIntegerError(n)));
  });

  it('fails if slowPeriod is lower or equal fastPeriod', () => {
    expect(macd([], 3, 1)).toStrictEqual(
      left(new PeriodSizeMissmatchError('slowPeriod', 'fastPeriod')),
    );
  });

  it('fails if not enough data to calculate for periods', () => {
    expect(macd([1, 2])).toStrictEqual(left(new NotEnoughDataError(35, 35)));
  });

  test.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
    'fails if values contains a infinit value $v',
    ({ v }) => {
      expect(macd(v, 2, 3, 1)).toStrictEqual(left(new InfinitNumberError()));
    },
  );

  it('calculates the Moving Average Convergence / Divergence with default period', () => {
    expect(macd(prices.close)).eitherRightToEqualFixedPrecision(prices.macd);
  });

  test.each([
    {
      v: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      p: [2, 3, 1],
      r: { macd: [0, 0, 0, 0, 0, 0, 0, 0], signal: [0, 0, 0, 0, 0, 0, 0, 0] },
    },
    { v: prices.close, p: [12, 26, 9], r: prices.macd },
  ])(
    'calculates the Moving Average Convergence / Divergence on prices in test $#',
    ({ v, p, r }) => {
      expect(macd(v, ...p)).eitherRightToEqualFixedPrecision(r);
    },
  );
});
