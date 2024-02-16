import { either as E } from 'fp-ts/lib';
import { describe, expect, it } from 'vitest';

import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { UnequalArraySizesError } from '../../src/errors/UnequalArraySizesError.js';
import { toPromise } from '../../src/utils/toPromise.js';

describe('toPromise', () => {
	it.each([
		{ v: E.left(new NotEnoughDataError(5, 5)), r: new NotEnoughDataError(5, 5) },
		{ v: E.left(new UnequalArraySizesError()), r: new UnequalArraySizesError() },
	])('rejects Either to Promise $v', async ({ v, r }) => {
		expect.assertions(1);
		await expect(toPromise(v)).rejects.toStrictEqual(r);
	});

	it.each([
		{ v: E.right([]), r: [] },
		{ v: E.right([1.5, -2.5]), r: [1.5, -2.5] },
	])('resolves Either to Promise $v', async ({ v, r }) => {
		expect.assertions(1);
		await expect(toPromise(v)).resolves.toStrictEqual(r);
	});
});
