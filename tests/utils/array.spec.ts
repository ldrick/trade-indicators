import * as R from 'effect/Result';
import { describe, expect, it } from 'vitest';

import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotFiniteNumberError } from '../../src/errors/NotFiniteNumberError.js';
import * as array from '../../src/utils/array.js';

describe('validateFinite', () => {
	it('accepts finite values', () => {
		expect(array.validateFinite([1, -2.5, 0])).toStrictEqual(R.succeed([1, -2.5, 0]));
	});

	it.each([{ v: NaN }, { v: Infinity }, { v: -Infinity }])('rejects $v', ({ v }) => {
		expect(array.validateFinite([1, v])).toStrictEqual(R.fail(new NotFiniteNumberError()));
	});
});

describe('validateRequiredSize', () => {
	it('accepts arrays with at least the required size', () => {
		expect(array.validateRequiredSize(2)([1, 2])).toStrictEqual(R.succeed([1, 2]));
	});

	it.each([{ v: [] }, { v: [1] }])('rejects $v', ({ v }) => {
		expect(array.validateRequiredSize(2)(v)).toStrictEqual(
			R.fail(new NotEnoughDataError(v.length, 2)),
		);
	});
});
