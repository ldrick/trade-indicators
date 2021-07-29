import { Big } from 'big.js';
import { either as E } from 'fp-ts/lib';
import { unwrap } from '../../src';
import { NotEnoughDataError, UnequalArraySizesError } from '../../src/errors';

describe('unwrap', () => {
  test.each([
    { v: E.left(new NotEnoughDataError(5, 5)), r: new NotEnoughDataError(5, 5) },
    { v: E.left(new UnequalArraySizesError()), r: new UnequalArraySizesError() },
  ])('rejects Either to Promise $v', async ({ v, r }) => {
    expect.assertions(1);
    await expect(unwrap(v)).rejects.toStrictEqual(r);
  });

  test.each([
    { v: E.right([]), r: [] },
    { v: E.right([new Big(1.5), new Big(-2.5)]), r: [1.5, -2.5] },
  ])('resolves Either with BigArray to Promise with NumberArray $v', async ({ v, r }) => {
    expect.assertions(1);
    await expect(unwrap(v)).resolves.toStrictEqual(r);
  });

  test.each([
    {
      v: E.right({ abc: [] }),
      r: { abc: [] },
    },
    {
      v: E.right({ macd: [new Big(1.5), new Big(-2.5)], signal: [new Big(1), new Big(45)] }),
      r: { macd: [1.5, -2.5], signal: [1, 45] },
    },
  ])('resolves Either with BigObject to Promise with NumberObject $v', async ({ v, r }) => {
    expect.assertions(1);
    await expect(unwrap(v)).resolves.toStrictEqual(r);
  });
});
