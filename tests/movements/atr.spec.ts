import { either as E } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import { UnequalArraySizesError } from '../../src/errors/UnequalArraySizesError.js';
import { atr } from '../../src/movements/atr.js';
import * as prices from '../prices.json' with { type: 'json' };

describe('atr', () => {
	it.each([
		{ p: Number.NaN },
		{ p: Number.POSITIVE_INFINITY },
		{ p: Number.NEGATIVE_INFINITY },
		{ p: -1 },
		{ p: 0 },
		{ p: 1.5 },
	])('fails if period is not a positive integer $p', ({ p }) => {
		expect(atr({ close: [1.3], high: [1.5], low: [0.9] }, p)).toStrictEqual(
			E.left(new NotPositiveIntegerError()),
		);
	});

	it('fails if not enough data to calculate for period', () => {
		expect(atr({ close: [1, 2, 3], high: [1, 2, 3], low: [1, 2, 3] }, 3)).toStrictEqual(
			E.left(new NotEnoughDataError(3, 4)),
		);
	});

	it('fails if data given has unequal sizes', () => {
		expect(
			atr({ close: [1.3, 2.1, 2, 3, 1.9], high: [1.5, 2.4, 2.8, 2.3], low: [0.9, 1.5, 2.3] }, 1),
		).toStrictEqual(E.left(new UnequalArraySizesError()));
	});

	it.each([
		{ v: { close: [0, 0, 0, 0], high: [0, 0, Number.NaN, 0], low: [0, 0, 0, 0] } },
		{ v: { close: [0, 0, 0, 0], high: [0, 0, 0, 0], low: [0, 0, Number.POSITIVE_INFINITY, 0] } },
		{ v: { close: [0, Number.NEGATIVE_INFINITY, 0, 0], high: [0, 0, 0, 0], low: [0, 0, 0, 0] } },
	])('fails if any value is a infinit value $v', ({ v }) => {
		expect(atr(v, 2)).toStrictEqual(E.left(new Error('[big.js] Invalid number')));
	});

	it('calculates the Average True Range with default period', () => {
		expect(
			atr({ close: prices.default.close, high: prices.default.high, low: prices.default.low }),
		).eitherRightToEqualFixedPrecision(prices.default.atr.p14);
	});

	it.each([
		{ p: 3, r: [0], v: { close: [0, 0, 0, 0], high: [0, 0, 0, 0], low: [0, 0, 0, 0] } },
		{
			p: 14,
			r: prices.default.atr.p14,
			v: { close: prices.default.close, high: prices.default.high, low: prices.default.low },
		},
	])('calculates the Average True Range on prices with period $p', ({ p, r, v }) => {
		expect(atr(v, p)).eitherRightToEqualFixedPrecision(r);
	});
});
