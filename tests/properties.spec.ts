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

describe.each([
	{ fn: sma, name: 'sma' },
	{ fn: wma, name: 'wma' },
])('$name properties', ({ fn }) => {
	it('returns values.length - period + 1 values, each within its window', () => {
		fc.assert(
			fc.property(pricesWithPeriod(atLeastPeriod), ({ p, v }) => {
				const result = getRight(fn(v, p));
				expect(result).toHaveLength(v.length - p + 1);
				for (const [index, value] of result.entries()) {
					const window = v.slice(index, index + p);
					expect(isBetween(value, Math.min(...window), Math.max(...window))).toBe(true);
				}
			}),
		);
	});
});

describe.each([
	{ fn: ema, length: (n: number, p: number) => n - p + 1, minLength: atLeastPeriod, name: 'ema' },
	{
		fn: smma,
		length: (n: number, p: number) => n - p + 1,
		minLength: atLeastPeriod,
		name: 'smma',
	},
	{
		fn: dema,
		length: (n: number, p: number) => n - 2 * p + 2,
		minLength: (p: number) => 2 * p - 1,
		name: 'dema',
	},
	{
		fn: tema,
		length: (n: number, p: number) => n - 3 * p + 3,
		minLength: (p: number) => 3 * p - 2,
		name: 'tema',
	},
])('$name properties', ({ fn, length, minLength }) => {
	it('returns the expected number of values', () => {
		fc.assert(
			fc.property(pricesWithPeriod(minLength), ({ p, v }) => {
				expect(getRight(fn(v, p))).toHaveLength(length(v.length, p));
			}),
		);
	});

	it('returns the constant itself for a constant series', () => {
		fc.assert(
			fc.property(price, period, (c, p) => {
				const values = constantSeries(c, minLength(p) + 10);
				const result = getRight(fn(values, p));
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
				const result = getRight(fn(v, p));
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

	it('returns macd, signal and histogram (macd - signal) of length values.length - slowPeriod + 1', () => {
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
					expect(result.macd).toHaveLength(v.length - ps.slow + 1);
					expect(result.signal).toHaveLength(result.macd.length);
					expect(result.signal.filter((s) => s === null)).toHaveLength(ps.signal - 1);
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
	it('returns values.length - period non-negative values bounded by the largest range', () => {
		fc.assert(
			fc.property(
				candlesWithPeriod((p) => p + 1),
				({ p, v }) => {
					const result = getRight(atr(v, p));
					const maxRange = Math.max(...v.high) - Math.min(...v.low);
					expect(result).toHaveLength(v.close.length - p);
					for (const value of result) {
						expect(isBetween(value, 0, maxRange)).toBe(true);
					}
				},
			),
		);
	});
});

describe('adx properties', () => {
	it('returns pdi, mdi and adx within 0 and 100', () => {
		fc.assert(
			fc.property(
				candlesWithPeriod((p) => 2 * p),
				({ p, v }) => {
					const result = getRight(adx(v, p));
					expect(result.pdi).toHaveLength(v.close.length - p);
					expect(result.mdi).toHaveLength(result.pdi.length);
					expect(result.adx).toHaveLength(result.pdi.length);
					for (const value of [...result.pdi, ...result.mdi, ...result.adx]) {
						expect(value === null || isBetween(value, 0, 100)).toBe(true);
					}
				},
			),
		);
	});
});

describe('rsi properties', () => {
	it('returns values.length - period values within 0 and 100', () => {
		fc.assert(
			fc.property(
				pricesWithPeriod((p) => p + 1),
				({ p, v }) => {
					const result = getRight(rsi(v, p));
					expect(result).toHaveLength(v.length - p);
					for (const value of result) {
						expect(isBetween(value, 0, 100)).toBe(true);
					}
				},
			),
		);
	});
});
