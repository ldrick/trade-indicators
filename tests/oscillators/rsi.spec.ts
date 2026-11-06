import { either as E } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotFiniteNumberError } from '../../src/errors/NotFiniteNumberError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import { rsi } from '../../src/oscillators/rsi.js';
import * as prices from '../prices.json' with { type: 'json' };

// StockCharts' published RSI(14) example ("cs-rsi.xls")
const stockCharts = {
	r: [70.46, 66.25, 66.48, 69.35, 66.29, 57.92],
	v: [
		44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61,
		46.28, 46.28, 46, 46.03, 46.41, 46.22, 45.64,
	],
};

describe('rsi', () => {
	it.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
		'fails if period is not a positive integer $p',
		({ p }) => {
			expect(rsi([], p)).toStrictEqual(E.left(new NotPositiveIntegerError()));
		},
	);

	it('fails if not enough data to calculate for period', () => {
		expect(rsi([1, 2, 3], 3)).toStrictEqual(E.left(new NotEnoughDataError(3, 4)));
	});

	it.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
		'fails if values contains a infinit value $v',
		({ v }) => {
			expect(rsi(v, 2)).toStrictEqual(E.left(new NotFiniteNumberError()));
		},
	);

	it('calculates the Relative Strength Index with default period', () => {
		expect(rsi(prices.default.close)).eitherRightToEqualFixedPrecision(prices.default.rsi.p14);
	});

	it.each([
		{ d: 'neutral 50 without any change', p: 2, r: [50, 50], v: [1, 1, 1, 1] },
		{ d: '100 with only gains', p: 2, r: [100, 100], v: [1, 2, 3, 4] },
		{ d: '0 with only losses', p: 2, r: [0, 0], v: [4, 3, 2, 1] },
		// deltas [1, -1, 2, -2]: avg gain/loss 1/2 & 1/2, then 5/4 & 1/4, then 5/8 & 9/8
		{ d: 'smoothed gains and losses', p: 2, r: [50, 250 / 3, 250 / 7], v: [1, 2, 1, 3, 1] },
	])('calculates $d', ({ p, r, v }) => {
		expect(rsi(v, p)).eitherRightToEqualFixedPrecision(r);
	});

	it('matches the published StockCharts example', () => {
		expect(rsi(stockCharts.v, 14)).eitherRightToEqualFixedPrecision(stockCharts.r, 2);
	});
});
