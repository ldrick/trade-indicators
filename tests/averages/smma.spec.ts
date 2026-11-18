import { describe, expect, it } from 'vitest';

import { smma } from '../../src/averages/smma.js';
import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotFiniteNumberError } from '../../src/errors/NotFiniteNumberError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import * as prices from '../prices.json' with { type: 'json' };
import { aligned, failure } from '../result.js';

describe('smma', () => {
	it.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
		'fails if period is not a positive integer $p',
		({ p }) => {
			expect(smma([], p)).toStrictEqual(failure(new NotPositiveIntegerError()));
		},
	);

	it('fails if not enough data to calculate for period', () => {
		expect(smma([1, 2], 3)).toStrictEqual(failure(new NotEnoughDataError(2, 3)));
	});

	it.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
		'fails if values contains a infinit value $v',
		({ v }) => {
			expect(smma(v, 2)).toStrictEqual(failure(new NotFiniteNumberError()));
		},
	);

	it('calculates the Smoothed Moving Average with default period', () => {
		expect(smma(prices.default.close)).okToEqualFixedPrecision(
			aligned(prices.default.smma.p20, prices.default.close.length),
		);
	});

	it.each([
		{ p: 3, r: [0], v: [0, 0, 0] },
		{ p: 10, r: prices.default.smma.p10, v: prices.default.close },
		{ p: 20, r: prices.default.smma.p20, v: prices.default.close },
	])('calculates the Smoothed Moving Average with period $p', ({ p, r, v }) => {
		expect(smma(v, p)).okToEqualFixedPrecision(aligned(r, v.length));
	});
});
