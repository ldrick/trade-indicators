import { describe, expect, it } from 'vitest';

import {
	adx,
	atr,
	dema,
	ema,
	type Incremental,
	incrementalEma,
	macd,
	rsi,
	sma,
	smma,
	tema,
	wma,
} from '../src/index.js';

// For 8 times the input, linear algorithms take about 8 to 15 times as long (cache and garbage
// collection add some overhead), quadratic ones about 64 times. Comparing growth instead of
// absolute times keeps the check independent of the machine's speed.
const SMALL = 12_500;
const LARGE = 8 * SMALL;
const MAX_GROWTH = 24;
const RUNS = 5;

const series = (length: number) =>
	Array.from({ length }, (_, index) => 100 + Math.sin(index) * 7 + (index % 13) * 0.1);
const candles = (length: number) => {
	const close = series(length);
	return {
		close,
		high: close.map((value) => value + 1),
		low: close.map((value) => value - 1),
	};
};

/**
Fastest of several runs, which is the least affected by other load on the machine.
 */
const fastest = (run: () => unknown): number =>
	Math.min(
		...Array.from({ length: RUNS }, () => {
			const start = performance.now();
			run();
			return performance.now() - start;
		}),
	);

const growth = <T>(input: (length: number) => T, run: (input: T) => unknown): number => {
	const small = input(SMALL);
	const large = input(LARGE);
	run(small);
	return fastest(() => run(large)) / fastest(() => run(small));
};

const pushAll = (start: Incremental<number, null | number>, values: readonly number[]) =>
	values.reduce((indicator, value) => {
		const pushed = indicator.push(value);
		return pushed.ok ? pushed.value : indicator;
	}, start);

describe('indicators scale linearly with the input length', () => {
	it.each([
		{ name: 'sma', run: (values: readonly number[]) => sma(values, 200) },
		{ name: 'wma', run: (values: readonly number[]) => wma(values, 200) },
		{ name: 'ema', run: (values: readonly number[]) => ema(values, 20) },
		{ name: 'smma', run: (values: readonly number[]) => smma(values, 20) },
		{ name: 'dema', run: (values: readonly number[]) => dema(values, 20) },
		{ name: 'tema', run: (values: readonly number[]) => tema(values, 20) },
		{ name: 'macd', run: (values: readonly number[]) => macd(values) },
		{ name: 'rsi', run: (values: readonly number[]) => rsi(values) },
	])('$name', ({ run }) => {
		expect(growth(series, run)).toBeLessThan(MAX_GROWTH);
	});

	it.each([
		{ name: 'atr', run: (values: ReturnType<typeof candles>) => atr(values) },
		{ name: 'adx', run: (values: ReturnType<typeof candles>) => adx(values) },
	])('$name', ({ run }) => {
		expect(growth(candles, run)).toBeLessThan(MAX_GROWTH);
	});

	it('incrementalEma', () => {
		const created = incrementalEma(20);
		if (!created.ok) {
			throw created.error;
		}
		expect(growth(series, (values) => pushAll(created.value, values))).toBeLessThan(MAX_GROWTH);
	});
});
