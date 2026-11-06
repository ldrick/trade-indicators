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

interface AtrState {
	readonly previousClose: null | number;
	readonly trueRange: SmootherState;
}

/**
 * True Range of a candle given the previous close.
 * @internal
 */
export const trueRange = (candle: Candle, previousClose: number): number =>
	Math.max(
		candle.high - candle.low,
		Math.abs(candle.high - previousClose),
		Math.abs(candle.low - previousClose),
	);

/**
 * ATR as stepper: the Wilder-smoothed True Range, starting with the second candle.
 * @internal
 */
const atrStepper = (period: number): Stepper<AtrState, Candle, null | number> => {
	const smoothing = smmaStepper(period);
	return {
		initial: { previousClose: null, trueRange: smoothing.initial },
		step: (state, candle) => {
			if (state.previousClose === null) {
				return [{ ...state, previousClose: candle.close }, null];
			}
			const [smoothed, value] = smoothing.step(
				state.trueRange,
				trueRange(candle, state.previousClose),
			);
			return [{ previousClose: candle.close, trueRange: smoothed }, value];
		},
	};
};

/**
 * The Average True Range (ATR) is the smoothed average of the True Range,
 * being the greatest out of current high minus the current low,
 * the absolute value of current high minus previous close
 * and the absolute value of the current low minus the previous close.
 *
 * `high`, `low` and `close` must have the same length (otherwise `UnequalArraySizesError`)
 * of at least `period + 1`. Returns one value per input value; the first `period` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { atr } from '@ldrick/trade-indicators';
 *
 * const values = { close: [2, 3, 4, 5], high: [3, 4, 5, 6], low: [1, 2, 3, 4] };
 * assert.deepStrictEqual(atr(values, 2), { ok: true, value: [null, null, 2, 2] });
 * ```
 * @category indicators
 * @since 0.2.0
 * @public
 */
export const atr = (
	values: HighLowClose<number>,
	period = 14,
): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			sizesV: rec.validateEqualSizes(values),
			valuesV: rec.validateRequiredSize(period + 1)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => rec.validateFinite(valuesV)),
		R.map(({ periodV, valuesF }) => run(atrStepper(periodV))(rec.toCandles(valuesF))),
		fromResult,
	);

/**
 * Incremental Average True Range (ATR), see `atr`. Takes one candle per `push`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { incrementalAtr } from '@ldrick/trade-indicators';
 *
 * const created = incrementalAtr(2);
 * assert.ok(created.ok);
 *
 * let indicator = created.value;
 * const outputs: (null | number)[] = [];
 * for (const [high, low, close] of [[3, 1, 2], [4, 2, 3], [5, 3, 4], [6, 4, 5]]) {
 * 	const pushed = indicator.push({ close, high, low });
 * 	assert.ok(pushed.ok);
 * 	indicator = pushed.value;
 * 	outputs.push(indicator.value);
 * }
 * assert.deepStrictEqual(outputs, [null, null, 2, 2]);
 * ```
 * @category incremental
 * @since 0.9.0
 * @public
 */
export const incrementalAtr = (period = 14): Result<Incremental<Candle, null | number>> =>
	pipe(
		number_.validatePositiveInteger(period),
		R.map((periodV) => toIncremental(atrStepper(periodV), null, rec.validateCandle)),
		fromResult,
	);
