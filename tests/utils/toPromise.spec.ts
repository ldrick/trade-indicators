import { describe, expect, it } from 'vitest';

import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { UnequalArraySizesError } from '../../src/errors/UnequalArraySizesError.js';
import { toPromise } from '../../src/utils/toPromise.js';
import { failure, success } from '../result.js';

describe('toPromise', () => {
	it.each([
		{ r: new NotEnoughDataError(5, 5), v: failure(new NotEnoughDataError(5, 5)) },
		{ r: new UnequalArraySizesError(), v: failure(new UnequalArraySizesError()) },
	])('rejects Either to Promise $v', async ({ r, v }) => {
		expect.assertions(1);
		await expect(toPromise(v)).rejects.toStrictEqual(r);
	});

	it.each([
		{ r: [], v: success([]) },
		{ r: [1.5, -2.5], v: success([1.5, -2.5]) },
	])('resolves Either to Promise $v', async ({ r, v }) => {
		expect.assertions(1);
		await expect(toPromise(v)).resolves.toStrictEqual(r);
	});
});
