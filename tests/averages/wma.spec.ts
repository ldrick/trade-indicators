import { describe, expect, it } from 'vitest';

import { wma } from '../../src/averages/wma.js';
import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotFiniteNumberError } from '../../src/errors/NotFiniteNumberError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import * as prices from '../prices.json' with { type: 'json' };
import { aligned, failure } from '../result.js';

describe('wma', () => {
	it.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
		'fails if period is not a positive integer $p',
		({ p }) => {
			expect(wma([], p)).toStrictEqual(failure(new NotPositiveIntegerError()));
		},
	);

	it('fails if not enough data to calculate for period', () => {
		expect(wma([1, 2], 3)).toStrictEqual(failure(new NotEnoughDataError(2, 3)));
	});

	it.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
		'fails if values contains a infinit value $v',
		({ v }) => {
			expect(wma(v, 2)).toStrictEqual(failure(new NotFiniteNumberError()));
		},
	);

	it('calculates the Weighted Moving Average with default period', () => {
		expect(wma(prices.default.close)).okToEqualFixedPrecision(
			aligned(prices.default.wma.p20, prices.default.close.length),
		);
	});

	it.each([
		{ p: 3, r: [0], v: [0, 0, 0] },
		{ p: 10, r: prices.default.wma.p10, v: prices.default.close },
		{ p: 20, r: prices.default.wma.p20, v: prices.default.close },
	])('calculates the Weighted Moving Average with period $p', ({ p, r, v }) => {
		expect(wma(v, p)).okToEqualFixedPrecision(aligned(r, v.length));
	});
});
