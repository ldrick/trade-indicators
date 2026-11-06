import { describe, expect, it } from 'vitest';

import { sma } from '../../src/averages/sma.js';
import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotFiniteNumberError } from '../../src/errors/NotFiniteNumberError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import * as prices from '../prices.json' with { type: 'json' };
import { failure } from '../result.js';

describe('sma', () => {
	it.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
		'fails if period is not a positive integer $p',
		({ p }) => {
			expect(sma([1], p)).toStrictEqual(failure(new NotPositiveIntegerError()));
		},
	);

	it('fails if not enough data to calculate for period', () => {
		expect(sma([1, 2], 3)).toStrictEqual(failure(new NotEnoughDataError(2, 3)));
	});

	it.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
		'fails if values contains a infinit value $v',
		({ v }) => {
			expect(sma(v, 2)).toStrictEqual(failure(new NotFiniteNumberError()));
		},
	);

	it('calculates the Simple Moving Average with default period', () => {
		expect(sma(prices.default.close)).okToEqualFixedPrecision(prices.default.sma.p20);
	});

	it.each([
		{ p: 3, r: [0], v: [0, 0, 0] },
		{ p: 10, r: prices.default.sma.p10, v: prices.default.close },
		{ p: 20, r: prices.default.sma.p20, v: prices.default.close },
	])('calculates the Simple Moving Average with period $p', ({ p, r, v }) => {
		expect(sma(v, p)).okToEqualFixedPrecision(r);
	});
});
