import { NotEnoughDataError, UnequalArraySizesError } from '@src/errors';
import { toPromise } from '@src/index';
import { either as E } from 'fp-ts/lib';

describe('toPromise', () => {
	test.each([
		{ v: E.left(new NotEnoughDataError(5, 5)), r: new NotEnoughDataError(5, 5) },
		{ v: E.left(new UnequalArraySizesError()), r: new UnequalArraySizesError() },
	])('rejects Either to Promise $v', async ({ v, r }) => {
		expect.assertions(1);
		await expect(toPromise(v)).rejects.toStrictEqual(r);
	});

	test.each([
		{ v: E.right([]), r: [] },
		{ v: E.right([1.5, -2.5]), r: [1.5, -2.5] },
	])('resolves Either to Promise $v', async ({ v, r }) => {
		expect.assertions(1);
		await expect(toPromise(v)).resolves.toStrictEqual(r);
	});
});
