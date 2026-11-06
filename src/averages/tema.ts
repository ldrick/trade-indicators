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

interface TemaState {
	readonly one: SmootherState;
	readonly three: SmootherState;
	readonly two: SmootherState;
}

/**
 * TEMA as stepper: `3 * EMA - 3 * EMA(EMA) + EMA(EMA(EMA))`.
 * @internal
 */
const temaStepper = (period: number): Stepper<TemaState, number, null | number> => {
	const ema = emaStepper(period);
	const emaOfEma = skipNull(ema);
	return {
		initial: { one: ema.initial, three: ema.initial, two: ema.initial },
		step: (state, input) => {
			const [one, emaOne] = ema.step(state.one, input);
			const [two, emaTwo] = emaOfEma.step(state.two, emaOne);
			const [three, emaThree] = emaOfEma.step(state.three, emaTwo);
			return [
				{ one, three, two },
				emaOne === null || emaTwo === null || emaThree === null
					? null
					: 3 * emaOne - 3 * emaTwo + emaThree,
			];
		},
	};
};

/**
 * The Triple Exponential Moving Average (TEMA) uses three Exponential Moving Average (EMA)
 * to reduce noise and still get close to latest prices.
 * It can be used to identify support and resistance levels.
 * Also prices above the TEMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `3 * period - 2` values. Returns one value per input value; the first `3 * period - 3` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { tema } from '@ldrick/trade-indicators';
 *
 * assert.deepStrictEqual(tema([1, 2, 3, 4, 5, 6], 2), { ok: true, value: [null, null, null, 4, 5, 6] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const tema = (
	values: readonly number[],
	period = 20,
): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(3 * period - 2)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.map(({ periodV, valuesF }) => run(temaStepper(periodV))(valuesF)),
		fromResult,
	);

/**
 * Incremental Triple Exponential Moving Average (TEMA), see `tema`. `value` is `null` as long as `tema` returns `null` for that position.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { incrementalTema } from '@ldrick/trade-indicators';
 *
 * const created = incrementalTema(2);
 * assert.ok(created.ok);
 *
 * let indicator = created.value;
 * const outputs: (null | number)[] = [];
 * for (const input of [1, 2, 3, 4, 5, 6]) {
 * 	const pushed = indicator.push(input);
 * 	assert.ok(pushed.ok);
 * 	indicator = pushed.value;
 * 	outputs.push(indicator.value);
 * }
 * assert.deepStrictEqual(outputs, [null, null, null, 4, 5, 6]);
 * ```
 * @category incremental
 * @since 0.9.0
 * @public
 */
export const incrementalTema = (period = 20): Result<Incremental<number, null | number>> =>
	pipe(
		number_.validatePositiveInteger(period),
		R.map((periodV) => toIncremental(temaStepper(periodV), null, number_.validateFinite)),
		fromResult,
	);
