import { Big } from 'big.js';
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray';
import { amean } from '../../src/averages/amean';

describe('amean', () => {
  test.each(<{ v: NonEmptyArray<Big>; r: Big }[]>[
    { v: [new Big(0)], r: new Big(0) },
    { v: [new Big(1), new Big(2), new Big(3), new Big(-1)], r: new Big(1.25) },
  ])('calculates the Average for values $v', ({ v, r }) => {
    expect(amean(v)).toStrictEqual(r);
  });
});
