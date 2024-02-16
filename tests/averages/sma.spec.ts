import { either as E } from 'fp-ts/lib';
import { describe, expect, it } from 'vitest';

import { sma } from '../../src/averages/sma.js';
import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import * as prices from '../prices.json' assert { type: 'json' };

describe('sma', () => {
	it.each([
		{ p: Number.NaN },
		{ p: Number.POSITIVE_INFINITY },
		{ p: Number.NEGATIVE_INFINITY },
		{ p: -1 },
		{ p: 0 },
		{ p: 1.5 },
	])('fails if period is not a positive integer $p', ({ p }) => {
		expect(sma([1], p)).toStrictEqual(E.left(new NotPositiveIntegerError()));
	});

	it('fails if not enough data to calculate for period', () => {
		expect(sma([1, 2], 3)).toStrictEqual(E.left(new NotEnoughDataError(2, 3)));
	});

	it.each([
		{ v: [0, 0, Number.NaN, 0] },
		{ v: [0, 0, Number.POSITIVE_INFINITY, 0] },
		{ v: [0, 0, Number.NEGATIVE_INFINITY, 0] },
	])('fails if values contains a infinit value $v', ({ v }) => {
		expect(sma(v, 2)).toStrictEqual(E.left(new Error('[big.js] Invalid number')));
	});

	it('calculates the Simple Moving Average with default period', () => {
		expect(sma(prices.default.close)).eitherRightToEqualFixedPrecision(prices.default.sma.p20);
	});

	it.each([
		{ v: [0, 0, 0], p: 3, r: [0] },
		{ v: prices.default.close, p: 10, r: prices.default.sma.p10 },
		{ v: prices.default.close, p: 20, r: prices.default.sma.p20 },
	])('calculates the Simple Moving Average with period $p', ({ v, p, r }) => {
		expect(sma(v, p)).eitherRightToEqualFixedPrecision(r);
	});
});
