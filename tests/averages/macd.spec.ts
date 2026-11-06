import { either as E } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import { macd } from '../../src/averages/macd.js';
import { NotEnoughDataError } from '../../src/errors/NotEnoughDataError.js';
import { NotFiniteNumberError } from '../../src/errors/NotFiniteNumberError.js';
import { NotPositiveIntegerError } from '../../src/errors/NotPositiveIntegerError.js';
import { PeriodSizeMismatchError } from '../../src/errors/PeriodSizeMismatchError.js';
import * as prices from '../prices.json' with { type: 'json' };

// histogram is derived from the macd and signal fixtures: macd - signal
const expected = {
	histogram: prices.default.macd.signal.map((signal, index) =>
		signal === null ? null : (prices.default.macd.macd[index] ?? NaN) - signal,
	),
	...prices.default.macd,
};

describe('macd', () => {
	it.each([
		{ p: [NaN] },
		{ p: [1, NaN] },
		{ p: [1, 1, NaN] },
		{ p: [Infinity] },
		{ p: [1, Infinity] },
		{ p: [1, 1, Infinity] },
		{ p: [-Infinity] },
		{ p: [1, -Infinity] },
		{ p: [1, 1, -Infinity] },
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
			E.left(new PeriodSizeMismatchError('slowPeriod', 'fastPeriod')),
		);
	});

	it('fails if not enough data to calculate for periods', () => {
		expect(macd([1, 2, 3, 4], 3, 4, 2)).toStrictEqual(E.left(new NotEnoughDataError(4, 5)));
	});

	it.each([{ v: [0, 0, NaN, 0] }, { v: [0, 0, Infinity, 0] }, { v: [0, 0, -Infinity, 0] }])(
		'fails if values contains a infinit value $v',
		({ v }) => {
			expect(macd(v, 2, 3, 1)).toStrictEqual(E.left(new NotFiniteNumberError()));
		},
	);

	it('calculates the Moving Average Convergence / Divergence with default period', () => {
		expect(macd(prices.default.close)).eitherRightToEqualFixedPrecision(expected);
	});

	it.each([
		{
			p: [3, 4, 2],
			r: { histogram: [null, 0], macd: [0, 0], signal: [null, 0] },
			v: [0, 0, 0, 0, 0],
		},
		{ p: [12, 26, 9], r: expected, v: prices.default.close },
		{
			// fast EMA(1) = values, slow EMA(2) = [1.5, 19/6, 115/18], signal EMA(2) of macd
			p: [1, 2, 2],
			r: {
				histogram: [null, 1 / 6, 17 / 54],
				macd: [1 / 2, 5 / 6, 29 / 18],
				signal: [null, 2 / 3, 35 / 27],
			},
			v: [1, 2, 4, 8],
		},
	])(
		'calculates the Moving Average Convergence / Divergence on prices in test $#',
		({ p, r, v }) => {
			expect(macd(v, ...p)).eitherRightToEqualFixedPrecision(r);
		},
	);
});
