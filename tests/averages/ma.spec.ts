import { Big } from 'big.js';
import { either as E, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { amean } from '../../src/averages/amean';
import { ma } from '../../src/averages/ma';
import { NotEnoughDataError } from '../../src/errors';

describe('ma', () => {
  test.each(<
    {
      v: RNEA.ReadonlyNonEmptyArray<Big>;
      p: number;
      r: E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>>;
    }[]
  >[
    {
      v: [new Big(1), new Big(2), new Big(3), new Big(4), new Big(5)],
      p: 3,
      r: E.right([new Big(2), new Big(3), new Big(4)]),
    },
    {
      v: [new Big(0), new Big(0), new Big(0), new Big(0), new Big(0)],
      p: 8,
      r: E.left(new NotEnoughDataError(8, 8)),
    },
  ])('calculates an Moving Average with period $p', ({ v, p, r }) => {
    expect(ma(v, p, amean)).toStrictEqual(r);
  });
});
