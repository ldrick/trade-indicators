import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { smmaStepper } from '../averages/smma.js';
import { toIncremental } from '../steps/incremental.js';
import { type SmootherState } from '../steps/smoother.js';
import { run, type Stepper } from '../steps/stepper.js';
import {
	type Candle,
	type HighLowClose,
	type Incremental,
	type NonEmptyArray,
	type Result,
} from '../types.js';
import * as number_ from '../utils/number.js';
import * as rec from '../utils/record.js';
import { fromResult } from '../utils/result.js';
import { trueRange } from './atr.js';

/**
 * Result of `adx`. All three series have the length of the input values.
 * @category models
 * @since 0.9.0
 * @public
 */
export interface ADXReturn {
	adx: NonEmptyArray<null | number>;
	mdi: NonEmptyArray<null | number>;
	pdi: NonEmptyArray<null | number>;
}

/**
 * Output of `incrementalAdx` for one candle; each field is `null` as long as the batch `adx` returns `null` at that position.
 * @category models
 * @since 0.9.0
 * @public
 */
export interface ADXValue {
	readonly adx: null | number;
	readonly mdi: null | number;
	readonly pdi: null | number;
}

interface AdxState {
	readonly adx: SmootherState;
	readonly minus: SmootherState;
	readonly plus: SmootherState;
	readonly previous: Candle | null;
	readonly trueRange: SmootherState;
}

const movement = (base: number, comparison: number): number =>
	base > comparison && base > 0 ? base : 0;

const directionalIndex = (movementValue: number, trueRangeValue: number): number =>
	trueRangeValue === 0 ? 0 : (movementValue * 100) / trueRangeValue;

const directionalMovementIndex = (pdi: number, mdi: number): number =>
	pdi + mdi === 0 ? 0 : Math.abs(pdi - mdi) / (pdi + mdi);

const empty: ADXValue = { adx: null, mdi: null, pdi: null };

/**
 * ADX as stepper: Wilder-smoothed directional movements and True Range give PDI and MDI,
 * the smoothed directional movement index of both gives ADX.
 * @internal
 */
const adxStepper = (period: number): Stepper<AdxState, Candle, ADXValue> => {
	const smoothing = smmaStepper(period);
	return {
		initial: {
			adx: smoothing.initial,
			minus: smoothing.initial,
			plus: smoothing.initial,
			previous: null,
			trueRange: smoothing.initial,
		},
		step: (state, candle) => {
			if (state.previous === null) {
				return [{ ...state, previous: candle }, empty];
			}
			const up = candle.high - state.previous.high;
			const down = state.previous.low - candle.low;
			const [plus, plusValue] = smoothing.step(state.plus, movement(up, down));
			const [minus, minusValue] = smoothing.step(state.minus, movement(down, up));
			const [range, rangeValue] = smoothing.step(
				state.trueRange,
				trueRange(candle, state.previous.close),
			);
			const next = { ...state, minus, plus, previous: candle, trueRange: range };
			// v8 ignore next -- the three smoothers run in lockstep, so they are null together
			if (plusValue === null || minusValue === null || rangeValue === null) {
				return [next, empty];
			}
			const pdi = directionalIndex(plusValue, rangeValue);
			const mdi = directionalIndex(minusValue, rangeValue);
			const [adx, adxValue] = smoothing.step(state.adx, directionalMovementIndex(pdi, mdi));
			return [
				{ ...next, adx },
				{ adx: adxValue === null ? null : adxValue * 100, mdi, pdi },
			];
		},
	};
};

/**
 * The Average Directional Index (ADX) determines trend strength.
 * It also delivers Plus Directional Movement Indicator (PDI)
 * and Minus Directional Movement Indicator (MDI).
 * Crossings of these three values can be used to determine trend changes.
 *
 * `high`, `low` and `close` must have the same length (otherwise `UnequalArraySizesError`)
 * of at least `2 * period`. All three series have one value per input value within 0 and 100:
 * the first `period` values of `pdi` and `mdi` and the first `2 * period - 1` values of `adx` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { adx } from '@ldrick/trade-indicators';
 *
 * const result = adx(
 * 	{
 * 		close: [9, 11, 10, 13, 12, 15],
 * 		high: [10, 12, 11, 14, 13, 16],
 * 		low: [8, 9, 9, 11, 10, 13],
 * 	},
 * 	2,
 * );
 * assert.ok(result.ok);
 *
 * const round = (values: readonly (null | number)[]) => values.map((v) => v?.toFixed(2) ?? null);
 * assert.deepStrictEqual(round(result.value.pdi), [null, null, '40.00', '61.54', '32.00', '56.14']);
 * assert.deepStrictEqual(round(result.value.mdi), [null, null, '0.00', '0.00', '16.00', '7.02']);
 * assert.deepStrictEqual(round(result.value.adx), [null, null, null, '100.00', '66.67', '72.22']);
 * ```
 * @category indicators
 * @since 0.2.0
 * @public
 */
export const adx = (values: HighLowClose<number>, period = 14): Result<ADXReturn> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			sizesV: rec.validateEqualSizes(values),
			valuesV: rec.validateRequiredSize(2 * period)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => rec.validateFinite(valuesV)),
		R.map(({ periodV, valuesF }) => {
			const outputs = run(adxStepper(periodV))(rec.toCandles(valuesF));
			return {
				adx: Arr.map(outputs, (output) => output.adx),
				mdi: Arr.map(outputs, (output) => output.mdi),
				pdi: Arr.map(outputs, (output) => output.pdi),
			};
		}),
		fromResult,
	);

/**
 * Incremental Average Directional Index (ADX), see `adx`. Takes one candle per `push`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { incrementalAdx } from '@ldrick/trade-indicators';
 *
 * const created = incrementalAdx(2);
 * assert.ok(created.ok);
 *
 * const candles = [
 * 	{ close: 9, high: 10, low: 8 },
 * 	{ close: 11, high: 12, low: 9 },
 * 	{ close: 10, high: 11, low: 9 },
 * 	{ close: 13, high: 14, low: 11 },
 * 	{ close: 12, high: 13, low: 10 },
 * 	{ close: 15, high: 16, low: 13 },
 * ];
 * let indicator = created.value;
 * for (const candle of candles) {
 * 	const pushed = indicator.push(candle);
 * 	assert.ok(pushed.ok);
 * 	indicator = pushed.value;
 * }
 * const { adx, mdi, pdi } = indicator.value;
 * assert.deepStrictEqual(
 * 	[pdi, mdi, adx].map((v) => v?.toFixed(2)),
 * 	['56.14', '7.02', '72.22'],
 * );
 * ```
 * @category incremental
 * @since 0.9.0
 * @public
 */
export const incrementalAdx = (period = 14): Result<Incremental<Candle, ADXValue>> =>
	pipe(
		number_.validatePositiveInteger(period),
		R.map((periodV) => toIncremental(adxStepper(periodV), empty, rec.validateCandle)),
		fromResult,
	);
