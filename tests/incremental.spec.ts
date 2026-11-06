import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
	adx,
	atr,
	dema,
	ema,
	incrementalAdx,
	incrementalAtr,
	incrementalDema,
	incrementalEma,
	incrementalMacd,
	incrementalRsi,
	incrementalSma,
	incrementalSmma,
	incrementalTema,
	incrementalWma,
	macd,
	NotFiniteNumberError,
	NotPositiveIntegerError,
	PeriodSizeMismatchError,
	rsi,
	sma,
	smma,
	tema,
	wma,
} from '../src/index.js';
import { type Candle, type Incremental, type Result } from '../src/types.js';
import { failure } from './result.js';

const getValue = <A>(result: Result<A, Error>): A => {
	if (!result.ok) {
		throw result.error;
	}
	return result.value;
};

// Push all inputs one by one and collect every output.
const pushAll = <I, O>(created: Result<Incremental<I, O>, Error>, inputs: readonly I[]): O[] =>
	inputs.reduce<{ indicator: Incremental<I, O>; outputs: O[] }>(
		({ indicator, outputs }, input) => {
			const next = getValue(indicator.push(input));
			return { indicator: next, outputs: [...outputs, next.value] };
		},
		{ indicator: getValue(created), outputs: [] },
	).outputs;

const price = fc.double({ max: 1e6, min: 0.01, noDefaultInfinity: true, noNaN: true });
const period = fc.integer({ max: 20, min: 1 });
const prices = (minLength: number) => fc.array(price, { maxLength: minLength + 100, minLength });
const candles = (minLength: number) =>
	fc
		.array(fc.tuple(price, price, fc.double({ max: 1, min: 0, noNaN: true })), {
			maxLength: minLength + 100,
			minLength,
		})
		.map((tuples) =>
			tuples.map(([a, b, ratio]): Candle => ({
				close: Math.min(a, b) + ratio * Math.abs(a - b),
				high: Math.max(a, b),
				low: Math.min(a, b),
			})),
		);
const toSeries = (values: readonly Candle[]) => ({
	close: values.map((candle) => candle.close),
	high: values.map((candle) => candle.high),
	low: values.map((candle) => candle.low),
});

describe('incremental equals batch, value by value', () => {
	it.each([
		{ batch: sma, incremental: incrementalSma, minLength: (p: number) => p, name: 'sma' },
		{ batch: wma, incremental: incrementalWma, minLength: (p: number) => p, name: 'wma' },
		{ batch: ema, incremental: incrementalEma, minLength: (p: number) => p, name: 'ema' },
		{ batch: smma, incremental: incrementalSmma, minLength: (p: number) => p, name: 'smma' },
		{
			batch: dema,
			incremental: incrementalDema,
			minLength: (p: number) => 2 * p - 1,
			name: 'dema',
		},
		{
			batch: tema,
			incremental: incrementalTema,
			minLength: (p: number) => 3 * p - 2,
			name: 'tema',
		},
		{ batch: rsi, incremental: incrementalRsi, minLength: (p: number) => p + 1, name: 'rsi' },
	])('$name', ({ batch, incremental, minLength }) => {
		fc.assert(
			fc.property(
				period.chain((p) => fc.tuple(fc.constant(p), prices(minLength(p)))),
				([p, values]) => {
					expect(pushAll(incremental(p), values)).toStrictEqual(
						getValue(batch(values, p)),
					);
				},
			),
		);
	});

	it('macd', () => {
		fc.assert(
			fc.property(
				fc
					.tuple(period, period, period)
					.chain(([fast, delta, signal]) =>
						fc.tuple(
							fc.constant([fast, fast + delta, signal] as const),
							prices(fast + delta + signal - 1),
						),
					),
				([[fast, slow, signal], values]) => {
					const expected = getValue(macd(values, fast, slow, signal));
					const outputs = pushAll(incrementalMacd(fast, slow, signal), values);
					expect(outputs.map((output) => output.macd)).toStrictEqual(expected.macd);
					expect(outputs.map((output) => output.signal)).toStrictEqual(expected.signal);
					expect(outputs.map((output) => output.histogram)).toStrictEqual(
						expected.histogram,
					);
				},
			),
		);
	});

	it('atr', () => {
		fc.assert(
			fc.property(
				period.chain((p) => fc.tuple(fc.constant(p), candles(p + 1))),
				([p, values]) => {
					const expected = getValue(atr(toSeries(values), p));
					expect(pushAll(incrementalAtr(p), values)).toStrictEqual(expected);
				},
			),
		);
	});

	it('adx', () => {
		fc.assert(
			fc.property(
				period.chain((p) => fc.tuple(fc.constant(p), candles(2 * p))),
				([p, values]) => {
					const expected = getValue(adx(toSeries(values), p));
					const outputs = pushAll(incrementalAdx(p), values);
					expect(outputs.map((output) => output.adx)).toStrictEqual(expected.adx);
					expect(outputs.map((output) => output.mdi)).toStrictEqual(expected.mdi);
					expect(outputs.map((output) => output.pdi)).toStrictEqual(expected.pdi);
				},
			),
		);
	});
});

describe('incremental instances', () => {
	it('start with an empty value', () => {
		expect(getValue(incrementalSma(2)).value).toBeNull();
		expect(getValue(incrementalMacd()).value).toStrictEqual({
			histogram: null,
			macd: null,
			signal: null,
		});
		expect(getValue(incrementalAdx()).value).toStrictEqual({ adx: null, mdi: null, pdi: null });
	});

	it('never change: pushing twice from the same instance gives the same result', () => {
		const start = getValue(incrementalSma(2));
		const one = getValue(start.push(1));
		const first = getValue(one.push(3));
		const second = getValue(one.push(5));
		expect([one.value, first.value, second.value]).toStrictEqual([null, 2, 3]);
		expect(getValue(first.push(5)).value).toBe(4);
		expect(getValue(second.push(5)).value).toBe(5);
	});
});

describe('incremental validation', () => {
	it.each([
		{ create: () => incrementalSma(0), name: 'sma' },
		{ create: () => incrementalWma(1.5), name: 'wma' },
		{ create: () => incrementalEma(-1), name: 'ema' },
		{ create: () => incrementalSmma(NaN), name: 'smma' },
		{ create: () => incrementalDema(0), name: 'dema' },
		{ create: () => incrementalTema(0), name: 'tema' },
		{ create: () => incrementalRsi(0), name: 'rsi' },
		{ create: () => incrementalAtr(0), name: 'atr' },
		{ create: () => incrementalAdx(0), name: 'adx' },
		{ create: () => incrementalMacd(0), name: 'macd' },
	])('$name rejects a period that is not a positive integer', ({ create }) => {
		expect(create()).toStrictEqual(failure(new NotPositiveIntegerError()));
	});

	it('macd rejects a slow period not greater than the fast period', () => {
		expect(incrementalMacd(3, 3)).toStrictEqual(
			failure(new PeriodSizeMismatchError('slowPeriod', 'fastPeriod')),
		);
	});

	it.each([{ v: NaN }, { v: Infinity }, { v: -Infinity }])('rejects pushing $v', ({ v }) => {
		expect(getValue(incrementalEma(2)).push(v)).toStrictEqual(
			failure(new NotFiniteNumberError()),
		);
	});

	it.each([
		{ candle: { close: NaN, high: 1, low: 1 } },
		{ candle: { close: 1, high: Infinity, low: 1 } },
		{ candle: { close: 1, high: 1, low: -Infinity } },
	])('rejects pushing the candle $candle', ({ candle }) => {
		expect(getValue(incrementalAtr(2)).push(candle)).toStrictEqual(
			failure(new NotFiniteNumberError()),
		);
		expect(getValue(incrementalAdx(2)).push(candle)).toStrictEqual(
			failure(new NotFiniteNumberError()),
		);
	});
});

const naiveMean = (window: readonly number[]) =>
	window.reduce((sum, value) => sum + value, 0) / window.length;
const naiveWeighted = (window: readonly number[]) =>
	window.reduce((sum, value, index) => sum + value * (index + 1), 0) /
	((window.length * (window.length + 1)) / 2);

describe('sliding sums stay exact over long series', () => {
	it.each([
		{ fn: sma, naive: naiveMean, name: 'sma' },
		{ fn: wma, naive: naiveWeighted, name: 'wma' },
	])('$name matches a full recalculation of every window', ({ fn, naive }) => {
		const values = Array.from({ length: 20_000 }, (_, index) => 1e6 + Math.sin(index) * 1e3);
		const p = 50;
		const result = getValue(fn(values, p));
		for (let index = p - 1; index < values.length; index += 997) {
			const expected = naive(values.slice(index - p + 1, index + 1));
			expect(Math.abs((result[index] ?? NaN) - expected) / expected).toBeLessThan(1e-12);
		}
	});
});
