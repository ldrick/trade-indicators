import { readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { nonEmptyTakeRight } from '../../src/utils';

describe('nonEmptyTakeRight', () => {
  test.each<{
    v: RNEA.ReadonlyNonEmptyArray<number>;
    n: number;
    r: RNEA.ReadonlyNonEmptyArray<number>;
  }>([
    // zero
    { v: [1, 2, 3], n: 0, r: [3] },
    // out of bounds
    { v: [1, 2, 3], n: 0.1, r: [1, 2, 3] },
    { v: [1, 2, 3], n: 5, r: [1, 2, 3] },
    { v: [1, 2, 3], n: -1, r: [1, 2, 3] },
    // in bounds
    { v: [1, 2, 3], n: 1, r: [3] },
    { v: [1, 2, 3], n: 2, r: [2, 3] },
    { v: [1, 2, 3], n: 3, r: [1, 2, 3] },
  ])('takes number $n right values from given Array $v', ({ v, n, r }) => {
    expect(nonEmptyTakeRight(n)(v)).toStrictEqual(r);
  });
});
