import { either as E } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import { UnequalArraySizesError } from '../../src/errors/UnequalArraySizesError.js';
import * as rec from '../../src/utils/record.js';

describe('validateEqualSizes', () => {
	it.each([
		{ close: [1, 2], high: [1, 2], low: [1, 2] },
		{ close: [], high: [], low: [] },
	])('accepts series of equal length $close', (v) => {
		expect(rec.validateEqualSizes(v)).toStrictEqual(E.right(v));
	});

	it.each([
		{ close: [1, 2], high: [1], low: [1, 2] },
		{ close: [1, 2], high: [1, 2], low: [1] },
		{ close: [1], high: [1, 2], low: [1, 2] },
	])('rejects series of unequal length $high $low $close', (v) => {
		expect(rec.validateEqualSizes(v)).toStrictEqual(E.left(new UnequalArraySizesError()));
	});
});
