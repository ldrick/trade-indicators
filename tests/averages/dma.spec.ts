import { either as E } from 'fp-ts/lib';
import { dma } from '../../src';
import { InfinitNumberError, NotEnoughDataError, NotPositiveIntegerError } from '../../src/errors';
import * as prices from '../prices.json';

describe('dma', () => {
  test.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
    'fails if period is not a positive integer $p',
    ({ p }) => {
      expect(dma([], p)).toStrictEqual(E.left(new NotPositiveIntegerError('period')));
    },
  );

  test.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
    'fails if values contains a infinit value $v',
    ({ v }) => {
      expect(dma(v, 2, 1)).toStrictEqual(E.left(new InfinitNumberError()));
    },
  );

  it('fails if not enough data to calculate for period', () => {
    expect(dma([1, 2], 3)).toStrictEqual(E.left(new NotEnoughDataError(3, 3)));
  });

  test.each([{ f: NaN }, { f: Infinity }, { f: -Infinity }])(
    'fails if factor is not a finit number $f',
    ({ f }) => {
      expect(dma([1, 2, 3], 2, f)).toStrictEqual(E.left(new InfinitNumberError()));
    },
  );

  it('calculates the Displaced Moving Average with default period and factor, which equals ema', () => {
    expect(dma(prices.close)).eitherRightToEqualFixedPrecision(prices.ema.p20);
  });

  test.each([
    { v: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], p: 3, r: [0, 0, 0, 0, 0, 0, 0, 0], f: 1 },
    { v: prices.close, p: 10, f: 1, r: prices.dma.p10 },
    { v: prices.close, p: 20, f: 1, r: prices.dma.p20 },
  ])('calculates the Displaced Moving Average with period $p', ({ v, p, f, r }) => {
    expect(dma(v, p, f)).eitherRightToEqualFixedPrecision(r);
  });
});
