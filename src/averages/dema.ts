import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { toIncremental } from '../steps/incremental.js';
import { type SmootherState } from '../steps/smoother.js';
import { run, skipNull, type Stepper } from '../steps/stepper.js';
import { type Incremental, type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromResult } from '../utils/result.js';
import { emaStepper } from './ema.js';

interface DemaState {
	readonly one: SmootherState;
	readonly two: SmootherState;
}

/**
 * DEMA as stepper: `2 * EMA - EMA(EMA)`.
 * @internal
 */
const demaStepper = (period: number): Stepper<DemaState, number, null | number> => {
	const ema = emaStepper(period);
	const emaOfEma = skipNull(ema);
	return {
		initial: { one: ema.initial, two: ema.initial },
		step: (state, input) => {
			const [one, emaOne] = ema.step(state.one, input);
			const [two, emaTwo] = emaOfEma.step(state.two, emaOne);
			return [{ one, two }, emaOne === null || emaTwo === null ? null : 2 * emaOne - emaTwo];
		},
	};
};

/**
 * The Double Exponential Moving Average (DEMA) uses two Exponential Moving Average (EMA)
 * to reduce noise. It can be used to identify support and resistance levels.
 * Also prices above the DEMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `2 * period - 1` values. Returns one value per input value; the first `2 * period - 2` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { dema } from '@ldrick/trade-indicators';
 *
 * assert.deepStrictEqual(dema([1, 2, 3, 4, 5], 2), { ok: true, value: [null, null, 3, 4, 5] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const dema = (
	values: readonly number[],
	period = 20,
): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(2 * period - 1)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.map(({ periodV, valuesF }) => run(demaStepper(periodV))(valuesF)),
		fromResult,
	);

/**
 * Incremental Double Exponential Moving Average (DEMA), see `dema`. `value` is `null` as long as `dema` returns `null` for that position.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { incrementalDema } from '@ldrick/trade-indicators';
 *
 * const created = incrementalDema(2);
 * assert.ok(created.ok);
 *
 * let indicator = created.value;
 * const outputs: (null | number)[] = [];
 * for (const input of [1, 2, 3, 4, 5]) {
 * 	const pushed = indicator.push(input);
 * 	assert.ok(pushed.ok);
 * 	indicator = pushed.value;
 * 	outputs.push(indicator.value);
 * }
 * assert.deepStrictEqual(outputs, [null, null, 3, 4, 5]);
 * ```
 * @category incremental
 * @since 0.9.0
 * @public
 */
export const incrementalDema = (period = 20): Result<Incremental<number, null | number>> =>
	pipe(
		number_.validatePositiveInteger(period),
		R.map((periodV) => toIncremental(demaStepper(periodV), null, number_.validateFinite)),
		fromResult,
	);
