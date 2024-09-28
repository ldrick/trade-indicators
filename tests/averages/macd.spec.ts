import { either as E } from 'fp-ts/lib';
import { describe, expect, it } from 'vitest';

import { macd } from '../../src/averages/macd.js';
import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import { PeriodSizeMissmatchError } from '../../src/errors/PeriodSizeMissmatchError.js';
import * as prices from '../prices.json' assert { type: 'json' };

describe('macd', () => {
	it.each([
		{ p: [Number.NaN] },
		{ p: [1, Number.NaN] },
		{ p: [1, 1, Number.NaN] },
		{ p: [Number.POSITIVE_INFINITY] },
		{ p: [1, Number.POSITIVE_INFINITY] },
		{ p: [1, 1, Number.POSITIVE_INFINITY] },
		{ p: [Number.NEGATIVE_INFINITY] },
		{ p: [1, Number.NEGATIVE_INFINITY] },
		{ p: [1, 1, Number.NEGATIVE_INFINITY] },
		{ p: [0] },
		{ p: [1, 0] },
		{ p: [1, 1, 0] },
		{ p: [-1] },
		{ p: [1, -1] },
		{ p: [1, 1, -1] },
		{ p: [1.5] },
		{ p: [1, 1.5] },
		{ p: [1, 1, 1.5] },
	])('fails if any period is not a positive integer $p', ({ p }) => {
		expect(macd([], ...p)).toStrictEqual(E.left(new NotPositiveIntegerError()));
	});

	it('fails if slowPeriod is lower or equal fastPeriod', () => {
		expect(macd([], 3, 1)).toStrictEqual(
			E.left(new PeriodSizeMissmatchError('slowPeriod', 'fastPeriod')),
		);
	});

	it('fails if not enough data to calculate for periods', () => {
		expect(macd([1, 2, 3, 4], 3, 4, 2)).toStrictEqual(E.left(new NotEnoughDataError(4, 5)));
	});

	it.each([
		{ v: [0, 0, Number.NaN, 0] },
		{ v: [0, 0, Number.POSITIVE_INFINITY, 0] },
		{ v: [0, 0, Number.NEGATIVE_INFINITY, 0] },
	])('fails if values contains a infinit value $v', ({ v }) => {
		expect(macd(v, 2, 3, 1)).toStrictEqual(E.left(new Error('[big.js] Invalid number')));
	});

	it('calculates the Moving Average Convergence / Divergence with default period', () => {
		expect(macd(prices.default.close)).eitherRightToEqualFixedPrecision(prices.default.macd);
	});

	it.each([
		{
			p: [3, 4, 2],
			r: { macd: [0, 0], signal: [null, 0] },
			v: [0, 0, 0, 0, 0],
		},
		{ p: [12, 26, 9], r: prices.default.macd, v: prices.default.close },
	])(
		'calculates the Moving Average Convergence / Divergence on prices in test $#',
		({ p, r, v }) => {
			expect(macd(v, ...p)).eitherRightToEqualFixedPrecision(r);
		},
	);
});
