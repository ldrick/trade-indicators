import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { PeriodSizeMismatchError } from '../errors/PeriodSizeMismatchError.js';
import { toIncremental } from '../steps/incremental.js';
import { type SmootherState } from '../steps/smoother.js';
import { run, skipNull, type Stepper } from '../steps/stepper.js';
import { type Incremental, type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromResult } from '../utils/result.js';
import { emaStepper } from './ema.js';

/**
 * Result of `macd`. All three series have the length of the input values;
 * `histogram` is `macd - signal`.
 * @category models
 * @since 0.9.0
 * @public
 */
export interface MACDReturn {
	histogram: NonEmptyArray<null | number>;
	macd: NonEmptyArray<null | number>;
	signal: NonEmptyArray<null | number>;
}

/**
 * Output of `incrementalMacd` for one value; each field is `null` as long as the batch `macd` returns `null` at that position.
 * @category models
 * @since 0.9.0
 * @public
 */
export interface MACDValue {
	readonly histogram: null | number;
	readonly macd: null | number;
	readonly signal: null | number;
}

interface MacdState {
	readonly fast: SmootherState;
	readonly signal: SmootherState;
	readonly slow: SmootherState;
}

const validatePeriods = (
	fastPeriod: number,
	slowPeriod: number,
	signalPeriod: number,
): R.Result<{ fastPeriodV: number; signalPeriodV: number; slowPeriodV: number }, Error> =>
	R.all({
		fastPeriodV: number_.validatePositiveInteger(fastPeriod),
		slowPeriodV: number_.validatePositiveInteger(slowPeriod),
		// eslint-disable-next-line perfectionist/sort-objects
		signalPeriodV: number_.validatePositiveInteger(signalPeriod),
		// eslint-disable-next-line perfectionist/sort-objects
		periodSizes:
			slowPeriod > fastPeriod
				? R.succeed(true)
				: R.fail(new PeriodSizeMismatchError('slowPeriod', 'fastPeriod')),
	});

/**
 * MACD as stepper: `EMA(fast) - EMA(slow)`, its signal EMA and their difference.
 * @internal
 */
const macdStepper = (
	fastPeriod: number,
	slowPeriod: number,
	signalPeriod: number,
): Stepper<MacdState, number, MACDValue> => {
	const fastEma = emaStepper(fastPeriod);
	const slowEma = emaStepper(slowPeriod);
	const signalEma = skipNull(emaStepper(signalPeriod));
	return {
		initial: { fast: fastEma.initial, signal: signalEma.initial, slow: slowEma.initial },
		step: (state, input) => {
			const [fast, fastValue] = fastEma.step(state.fast, input);
			const [slow, slowValue] = slowEma.step(state.slow, input);
			const macdValue =
				fastValue === null || slowValue === null ? null : fastValue - slowValue;
			const [signal, signalValue] = signalEma.step(state.signal, macdValue);
			return [
				{ fast, signal, slow },
				{
					histogram:
						macdValue === null || signalValue === null ? null : macdValue - signalValue,
					macd: macdValue,
					signal: signalValue,
				},
			];
		},
	};
};

/**
 * The Moving Average Convergence Divergence (MACD) is the relationship of
 * two Exponential Moving Averages (EMA) with different periods.
 * It generates crosses with the generated signal EMA which can be used
 * to indicate uptrends or downtrends. The histogram is MACD minus signal.
 *
 * `slowPeriod` must be greater than `fastPeriod` (otherwise `PeriodSizeMismatchError`)
 * and at least `slowPeriod + signalPeriod - 1` values are required.
 * All three series have one value per input value: the first `slowPeriod - 1` values
 * of `macd` and the first `slowPeriod + signalPeriod - 2` values of `signal` and `histogram` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { macd } from '@ldrick/trade-indicators';
 *
 * const result = macd([1, 2, 4, 8, 16], 1, 2, 2);
 * assert.ok(result.ok);
 *
 * const round = (values: readonly (null | number)[]) => values.map((v) => v?.toFixed(2) ?? null);
 * assert.deepStrictEqual(round(result.value.macd), [null, '0.50', '0.83', '1.61', '3.20']);
 * assert.deepStrictEqual(round(result.value.signal), [null, null, '0.67', '1.30', '2.57']);
 * assert.deepStrictEqual(round(result.value.histogram), [null, null, '0.17', '0.31', '0.64']);
 * ```
 * @category indicators
 * @since 0.3.0
 * @public
 */
export const macd = (
	values: readonly number[],
	fastPeriod = 12,
	slowPeriod = 26,
	signalPeriod = 9,
): Result<MACDReturn> =>
	pipe(
		validatePeriods(fastPeriod, slowPeriod, signalPeriod),
		R.bind('valuesV', () => array.validateRequiredSize(slowPeriod + signalPeriod - 1)(values)),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.map(({ fastPeriodV, signalPeriodV, slowPeriodV, valuesF }) => {
			const outputs = run(macdStepper(fastPeriodV, slowPeriodV, signalPeriodV))(valuesF);
			return {
				histogram: Arr.map(outputs, (output) => output.histogram),
				macd: Arr.map(outputs, (output) => output.macd),
				signal: Arr.map(outputs, (output) => output.signal),
			};
		}),
		fromResult,
	);

/**
 * Incremental Moving Average Convergence Divergence (MACD), see `macd`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { incrementalMacd } from '@ldrick/trade-indicators';
 *
 * const created = incrementalMacd(1, 2, 2);
 * assert.ok(created.ok);
 *
 * let indicator = created.value;
 * for (const input of [1, 2, 4, 8, 16]) {
 * 	const pushed = indicator.push(input);
 * 	assert.ok(pushed.ok);
 * 	indicator = pushed.value;
 * }
 * const { histogram, macd, signal } = indicator.value;
 * assert.deepStrictEqual(
 * 	[macd, signal, histogram].map((v) => v?.toFixed(2)),
 * 	['3.20', '2.57', '0.64'],
 * );
 * ```
 * @category incremental
 * @since 0.9.0
 * @public
 */
export const incrementalMacd = (
	fastPeriod = 12,
	slowPeriod = 26,
	signalPeriod = 9,
): Result<Incremental<number, MACDValue>> =>
	pipe(
		validatePeriods(fastPeriod, slowPeriod, signalPeriod),
		R.map(({ fastPeriodV, signalPeriodV, slowPeriodV }) =>
			toIncremental(
				macdStepper(fastPeriodV, slowPeriodV, signalPeriodV),
				{ histogram: null, macd: null, signal: null },
				number_.validateFinite,
			),
		),
		fromResult,
	);
