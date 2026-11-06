import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { dema } from '../src/averages/dema.js';
import { ema } from '../src/averages/ema.js';
import { macd } from '../src/averages/macd.js';
import { sma } from '../src/averages/sma.js';
import { smma } from '../src/averages/smma.js';
import { tema } from '../src/averages/tema.js';
import { wma } from '../src/averages/wma.js';
import { adx } from '../src/movements/adx.js';
import { atr } from '../src/movements/atr.js';
import { rsi } from '../src/oscillators/rsi.js';
import { type HighLowClose, type Result } from '../src/types.js';

const price = fc.double({ max: 1e6, min: 0.01, noDefaultInfinity: true, noNaN: true });
const period = fc.integer({ max: 30, min: 1 });
const atLeastPeriod = (p: number) => p;
// position of close between low and high
const closeRatio = fc.double({ max: 1, min: 0, noNaN: true });
const candle = fc.tuple(price, price, closeRatio);
const constantSeries = (c: number, length: number) => Array.from({ length }, () => c);

// Prices with at least `minLength(period)` values, together with the period.
const pricesWithPeriod = (minLength: (p: number) => number) =>
	period.chain((p) =>
		fc.record({
			p: fc.constant(p),
			v: fc.array(price, { maxLength: minLength(p) + 200, minLength: minLength(p) }),
		}),
	);

// High/Low/Close candles (low <= close <= high) with at least `minLength(period)` values.
const candlesWithPeriod = (minLength: (p: number) => number) =>
	period.chain((p) =>
		fc.record({
			p: fc.constant(p),
			v: fc
				.array(candle, {
					maxLength: minLength(p) + 200,
					minLength: minLength(p),
				})
				.map((candles): HighLowClose<number> => ({
					close: candles.map(([a, b, t]) => Math.min(a, b) + t * Math.abs(a - b)),
					high: candles.map(([a, b]) => Math.max(a, b)),
					low: candles.map(([a, b]) => Math.min(a, b)),
				})),
		}),
	);

// Relative tolerance for floating point comparisons against input bounds.
const tolerance = (reference: number) => Math.max(1, Math.abs(reference)) * 1e-9;

const getRight = <A>(result: Result<A, Error>): A => {
	if (!result.ok) {
		throw result.error;
	}
	return result.value;
};

const isBetween = (value: number, min: number, max: number) =>
	value >= min - tolerance(min) && value <= max + tolerance(max);

/**
 * Asserts that `series` has the input `length`, starts with exactly `nulls` nulls
 * and contains only numbers afterwards; returns these calculated numbers.
 */
const calculated = (series: readonly (null | number)[], length: number, nulls: number) => {
	expect(series).toHaveLength(length);
	expect(series.slice(0, nulls).every((value) => value === null)).toBe(true);
	const rest = series.slice(nulls).filter((value) => value !== null);
	expect(rest).toHaveLength(length - nulls);
	return rest;
};

describe.each([
	{ fn: sma, name: 'sma' },
	{ fn: wma, name: 'wma' },
])('$name properties', ({ fn }) => {
	it('aligns to the input with period - 1 leading nulls, each value within its window', () => {
		fc.assert(
			fc.property(pricesWithPeriod(atLeastPeriod), ({ p, v }) => {
				const result = calculated(getRight(fn(v, p)), v.length, p - 1);
				for (const [index, value] of result.entries()) {
					const window = v.slice(index, index + p);
					expect(isBetween(value, Math.min(...window), Math.max(...window))).toBe(true);
				}
			}),
		);
	});
});

describe.each([
	{ fn: ema, minLength: atLeastPeriod, name: 'ema', nulls: (p: number) => p - 1 },
	{ fn: smma, minLength: atLeastPeriod, name: 'smma', nulls: (p: number) => p - 1 },
	{
		fn: dema,
		minLength: (p: number) => 2 * p - 1,
		name: 'dema',
		nulls: (p: number) => 2 * p - 2,
	},
	{
		fn: tema,
		minLength: (p: number) => 3 * p - 2,
		name: 'tema',
		nulls: (p: number) => 3 * p - 3,
	},
])('$name properties', ({ fn, minLength, nulls }) => {
	it('aligns to the input with the expected number of leading nulls', () => {
		fc.assert(
			fc.property(pricesWithPeriod(minLength), ({ p, v }) => {
				const result = calculated(getRight(fn(v, p)), v.length, nulls(p));
				expect(result).toHaveLength(v.length - nulls(p));
			}),
		);
	});

	it('returns the constant itself for a constant series', () => {
		fc.assert(
			fc.property(price, period, (c, p) => {
				const values = constantSeries(c, minLength(p) + 10);
				const result = calculated(getRight(fn(values, p)), values.length, nulls(p));
				for (const value of result) {
					expect(Math.abs(value - c)).toBeLessThanOrEqual(tolerance(c));
				}
			}),
		);
	});
});

describe.each([
	{ fn: ema, name: 'ema' },
	{ fn: smma, name: 'smma' },
])('$name bounds', ({ fn }) => {
	it('stays within min and max of all values', () => {
		fc.assert(
			fc.property(pricesWithPeriod(atLeastPeriod), ({ p, v }) => {
				const min = Math.min(...v);
				const max = Math.max(...v);
				const result = calculated(getRight(fn(v, p)), v.length, p - 1);
				for (const value of result) {
					expect(isBetween(value, min, max)).toBe(true);
				}
			}),
		);
	});
});

describe('macd properties', () => {
	const periods = fc
		.tuple(fc.integer({ max: 20, min: 1 }), fc.integer({ max: 20, min: 1 }), period)
		.map(([fast, delta, signal]) => ({ fast, signal, slow: fast + delta }));

	it('aligns macd, signal and histogram (macd - signal) to the input', () => {
		fc.assert(
			fc.property(
				periods.chain((ps) =>
					fc.record({
						ps: fc.constant(ps),
						v: fc.array(price, {
							maxLength: ps.slow + ps.signal + 200,
							minLength: ps.slow + ps.signal - 1,
						}),
					}),
				),
				({ ps, v }) => {
					const result = getRight(macd(v, ps.fast, ps.slow, ps.signal));
					const signalNulls = ps.slow + ps.signal - 2;
					calculated(result.macd, v.length, ps.slow - 1);
					calculated(result.signal, v.length, signalNulls);
					calculated(result.histogram, v.length, signalNulls);
					for (const [index, histogram] of result.histogram.entries()) {
						const signal = result.signal[index] ?? null;
						const macdValue = result.macd[index] ?? NaN;
						expect(histogram).toStrictEqual(
							signal === null ? null : macdValue - signal,
						);
					}
				},
			),
		);
	});

	it('returns zero for a constant series', () => {
		fc.assert(
			fc.property(price, periods, (c, ps) => {
				const v = constantSeries(c, ps.slow + ps.signal + 10);
				const result = getRight(macd(v, ps.fast, ps.slow, ps.signal));
				for (const value of [...result.macd, ...result.signal, ...result.histogram]) {
					expect(Math.abs(value ?? 0)).toBeLessThanOrEqual(tolerance(c));
				}
			}),
		);
	});
});

describe('atr properties', () => {
	it('aligns to the input with period leading nulls, non-negative and bounded by the largest range', () => {
		fc.assert(
			fc.property(
				candlesWithPeriod((p) => p + 1),
				({ p, v }) => {
					const result = calculated(getRight(atr(v, p)), v.close.length, p);
					const maxRange = Math.max(...v.high) - Math.min(...v.low);
					for (const value of result) {
						expect(isBetween(value, 0, maxRange)).toBe(true);
					}
				},
			),
		);
	});
});

describe('adx properties', () => {
	it('aligns pdi, mdi and adx to the input, all within 0 and 100', () => {
		fc.assert(
			fc.property(
				candlesWithPeriod((p) => 2 * p),
				({ p, v }) => {
					const result = getRight(adx(v, p));
					const values = [
						...calculated(result.pdi, v.close.length, p),
						...calculated(result.mdi, v.close.length, p),
						...calculated(result.adx, v.close.length, 2 * p - 1),
					];
					for (const value of values) {
						expect(isBetween(value, 0, 100)).toBe(true);
					}
				},
			),
		);
	});
});

describe('rsi properties', () => {
	it('aligns to the input with period leading nulls, all within 0 and 100', () => {
		fc.assert(
			fc.property(
				pricesWithPeriod((p) => p + 1),
				({ p, v }) => {
					const result = calculated(getRight(rsi(v, p)), v.length, p);
					for (const value of result) {
						expect(isBetween(value, 0, 100)).toBe(true);
					}
				},
			),
		);
	});
});
