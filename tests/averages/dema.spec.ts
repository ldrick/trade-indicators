import { either as E } from 'fp-ts/lib';
import { describe, expect, it } from 'vitest';

import { dema } from '../../src/averages/dema.js';
import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import * as prices from '../prices.json' assert { type: 'json' };

describe('dema', () => {
	it.each([
		{ p: Number.NaN },
		{ p: Number.POSITIVE_INFINITY },
		{ p: Number.NEGATIVE_INFINITY },
		{ p: -1 },
		{ p: 0 },
		{ p: 1.5 },
	])('fails if period is not a positive integer $p', ({ p }) => {
		expect(dema([], p)).toStrictEqual(E.left(new NotPositiveIntegerError()));
	});

	it('fails if not enough data to calculate for period', () => {
		expect(dema([1, 2, 3, 4], 3)).toStrictEqual(E.left(new NotEnoughDataError(4, 5)));
	});

	it.each([
		{ v: [0, 0, Number.NaN, 0] },
		{ v: [0, 0, Number.POSITIVE_INFINITY, 0] },
		{ v: [0, 0, Number.NEGATIVE_INFINITY, 0] },
	])('fails if values contains a infinit value $v', ({ v }) => {
		expect(dema(v, 2)).toStrictEqual(E.left(new Error('[big.js] Invalid number')));
	});

	it('calculates the Double Exponential Moving Average with default period', () => {
		expect(dema(prices.default.close)).eitherRightToEqualFixedPrecision(prices.default.dema.p20);
	});

	it.each([
		{ p: 3, r: [0], v: [0, 0, 0, 0, 0] },
		{ p: 10, r: prices.default.dema.p10, v: prices.default.close },
		{ p: 20, r: prices.default.dema.p20, v: prices.default.close },
	])('calculates the Double Exponential Moving Average with period $p', ({ p, r, v }) => {
		expect(dema(v, p)).eitherRightToEqualFixedPrecision(r);
	});
});
