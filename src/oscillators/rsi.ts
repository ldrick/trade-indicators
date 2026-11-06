import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { smmaStepper } from '../averages/smma.js';
import { toIncremental } from '../steps/incremental.js';
import { type SmootherState } from '../steps/smoother.js';
import { run, type Stepper } from '../steps/stepper.js';
import { type Incremental, type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromResult } from '../utils/result.js';

interface RsiState {
	readonly gains: SmootherState;
	readonly losses: SmootherState;
	readonly previous: null | number;
}

const strength = (gain: number, loss: number): number =>
	gain + loss === 0 ? 50 : (100 * gain) / (gain + loss);

/**
 * RSI as stepper: Wilder-smoothed gains and losses of the changes between values.
 * @internal
 */
const rsiStepper = (period: number): Stepper<RsiState, number, null | number> => {
	const smoothing = smmaStepper(period);
	return {
		initial: { gains: smoothing.initial, losses: smoothing.initial, previous: null },
		step: (state, input) => {
			if (state.previous === null) {
				return [{ ...state, previous: input }, null];
			}
			const change = input - state.previous;
			const [gains, gain] = smoothing.step(state.gains, Math.max(change, 0));
			const [losses, loss] = smoothing.step(state.losses, Math.max(-change, 0));
			return [
				{ gains, losses, previous: input },
				// v8 ignore next -- gains and losses are smoothed in lockstep, so they are null together
				gain === null || loss === null ? null : strength(gain, loss),
			];
		},
	};
};

/**
 * The Relative Strength Index (RSI) by J. Welles Wilder is a momentum oscillator
 * between 0 and 100, comparing the smoothed average gains with the smoothed average losses.
 * Values above 70 are commonly seen as overbought, below 30 as oversold.
 * A series without any change yields the neutral value 50.
 *
 * Requires at least `period + 1` values. Returns one value per input value; the first `period` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { rsi } from '@ldrick/trade-indicators';
 *
 * const result = rsi([1, 2, 1, 3, 1], 2);
 * assert.ok(result.ok);
 * assert.deepStrictEqual(
 * 	result.value.map((v) => v?.toFixed(2) ?? null),
 * 	[null, null, '50.00', '83.33', '35.71'],
 * );
 * ```
 * @category indicators
 * @since 0.9.0
 * @public
 */
export const rsi = (values: readonly number[], period = 14): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period + 1)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.map(({ periodV, valuesF }) => run(rsiStepper(periodV))(valuesF)),
		fromResult,
	);

/**
 * Incremental Relative Strength Index (RSI), see `rsi`. `value` is `null` as long as `rsi` returns `null` for that position.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { incrementalRsi } from '@ldrick/trade-indicators';
 *
 * const created = incrementalRsi(2);
 * assert.ok(created.ok);
 *
 * let indicator = created.value;
 * const outputs: (null | number)[] = [];
 * for (const input of [1, 2, 1, 3, 1]) {
 * 	const pushed = indicator.push(input);
 * 	assert.ok(pushed.ok);
 * 	indicator = pushed.value;
 * 	outputs.push(indicator.value);
 * }
 * assert.deepStrictEqual(outputs, [null, null, 50, 250 / 3, 250 / 7]);
 * ```
 * @category incremental
 * @since 0.9.0
 * @public
 */
export const incrementalRsi = (period = 14): Result<Incremental<number, null | number>> =>
	pipe(
		number_.validatePositiveInteger(period),
		R.map((periodV) => toIncremental(rsiStepper(periodV), null, number_.validateFinite)),
		fromResult,
	);
