import { describe, expect, it } from 'vitest';

import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotFiniteNumberError } from '../../src/errors/NotFiniteNumberError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import { UnequalArraySizesError } from '../../src/errors/UnequalArraySizesError.js';
import { atr } from '../../src/movements/atr.js';
import * as prices from '../prices.json' with { type: 'json' };
import { failure } from '../result.js';

describe('atr', () => {
	it.each([{ p: NaN }, { p: Infinity }, { p: -Infinity }, { p: -1 }, { p: 0 }, { p: 1.5 }])(
		'fails if period is not a positive integer $p',
		({ p }) => {
			expect(atr({ close: [1.3], high: [1.5], low: [0.9] }, p)).toStrictEqual(
				failure(new NotPositiveIntegerError()),
			);
		},
	);

	it('fails if not enough data to calculate for period', () => {
		expect(atr({ close: [1, 2, 3], high: [1, 2, 3], low: [1, 2, 3] }, 3)).toStrictEqual(
			failure(new NotEnoughDataError(3, 4)),
		);
	});

	it('fails if data given has unequal sizes', () => {
		expect(
			atr(
				{ close: [1.3, 2.1, 2, 3, 1.9], high: [1.5, 2.4, 2.8, 2.3], low: [0.9, 1.5, 2.3] },
				1,
			),
		).toStrictEqual(failure(new UnequalArraySizesError()));
	});

	it('fails if close has more values than high and low', () => {
		expect(
			atr({ close: [1, 2, 3, 4, 5], high: [2, 3, 4, 5], low: [0, 1, 2, 3] }, 2),
		).toStrictEqual(failure(new UnequalArraySizesError()));
	});

	it.each([
		{ v: { close: [0, 0, 0, 0], high: [0, 0, NaN, 0], low: [0, 0, 0, 0] } },
		{
			v: {
				close: [0, 0, 0, 0],
				high: [0, 0, 0, 0],
				low: [0, 0, Infinity, 0],
			},
		},
		{
			v: {
				close: [0, -Infinity, 0, 0],
				high: [0, 0, 0, 0],
				low: [0, 0, 0, 0],
			},
		},
	])('fails if any value is a infinit value $v', ({ v }) => {
		expect(atr(v, 2)).toStrictEqual(failure(new NotFiniteNumberError()));
	});

	it('calculates the Average True Range with default period', () => {
		expect(
			atr({
				close: prices.default.close,
				high: prices.default.high,
				low: prices.default.low,
			}),
		).okToEqualFixedPrecision(prices.default.atr.p14);
	});

	it.each([
		{ p: 3, r: [0], v: { close: [0, 0, 0, 0], high: [0, 0, 0, 0], low: [0, 0, 0, 0] } },
		{
			p: 14,
			r: prices.default.atr.p14,
			v: { close: prices.default.close, high: prices.default.high, low: prices.default.low },
		},
	])('calculates the Average True Range on prices with period $p', ({ p, r, v }) => {
		expect(atr(v, p)).okToEqualFixedPrecision(r);
	});
});
