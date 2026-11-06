import { describe, expect, it } from 'vitest';

import { ema } from '../../src/averages/ema.js';
import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotFiniteNumberError } from '../../src/errors/NotFiniteNumberError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import * as prices from '../prices.json' with { type: 'json' };
import { failure } from '../result.js';

describe('ema', () => {
	it.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
		'fails if period is not a positive integer $p',
		({ p }) => {
			expect(ema([], p)).toStrictEqual(failure(new NotPositiveIntegerError()));
		},
	);

	it('fails if not enough data to calculate for period', () => {
		expect(ema([1, 2], 3)).toStrictEqual(failure(new NotEnoughDataError(2, 3)));
	});

	it.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
		'fails if values contains a infinit value $v',
		({ v }) => {
			expect(ema(v, 2)).toStrictEqual(failure(new NotFiniteNumberError()));
		},
	);

	it('calculates the Exponential Moving Average with default period', () => {
		expect(ema(prices.default.close)).okToEqualFixedPrecision(prices.default.ema.p20);
	});

	it.each([
		{ p: 3, r: [0], v: [0, 0, 0] },
		{ p: 10, r: prices.default.ema.p10, v: prices.default.close },
		{ p: 20, r: prices.default.ema.p20, v: prices.default.close },
	])('calculates the Exponential Moving Average with period $p', ({ p, r, v }) => {
		expect(ema(v, p)).okToEqualFixedPrecision(r);
	});
});
