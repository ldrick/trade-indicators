import { either as E } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import { wma } from '../../src/averages/wma.js';
import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import * as prices from '../prices.json' with { type: 'json' };

describe('wma', () => {
	it.each([
		{ p: Number.NaN },
		{ p: Number.POSITIVE_INFINITY },
		{ p: Number.NEGATIVE_INFINITY },
		{ p: -1 },
		{ p: 0 },
		{ p: 1.5 },
	])('fails if period is not a positive integer $p', ({ p }) => {
		expect(wma([], p)).toStrictEqual(E.left(new NotPositiveIntegerError()));
	});

	it('fails if not enough data to calculate for period', () => {
		expect(wma([1, 2], 3)).toStrictEqual(E.left(new NotEnoughDataError(2, 3)));
	});

	it.each([
		{ v: [0, 0, Number.NaN, 0] },
		{ v: [0, 0, Number.POSITIVE_INFINITY, 0] },
		{ v: [0, 0, Number.NEGATIVE_INFINITY, 0] },
	])('fails if values contains a infinit value $v', ({ v }) => {
		expect(wma(v, 2)).toStrictEqual(E.left(new Error('[big.js] Invalid number')));
	});

	it('calculates the Weighted Moving Average with default period', () => {
		expect(wma(prices.default.close)).eitherRightToEqualFixedPrecision(prices.default.wma.p20);
	});

	it.each([
		{ p: 3, r: [0], v: [0, 0, 0] },
		{ p: 10, r: prices.default.wma.p10, v: prices.default.close },
		{ p: 20, r: prices.default.wma.p20, v: prices.default.close },
	])('calculates the Weighted Moving Average with period $p', ({ p, r, v }) => {
		expect(wma(v, p)).eitherRightToEqualFixedPrecision(r);
	});
});
