import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { add, type CompensatedSum, emptySum, total } from '../steps/compensatedSum.js';
import { toIncremental } from '../steps/incremental.js';
import { type SlidingInput, slidingInputs, withWindow } from '../steps/sliding.js';
import { run, type Stepper } from '../steps/stepper.js';
import { type Incremental, type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromResult } from '../utils/result.js';

interface WmaState {
	readonly count: number;
	readonly sum: CompensatedSum;
	readonly weighted: CompensatedSum;
}

/**
 * WMA over a sliding window: the weighted sum of the next window is
 * `weighted - sum + period * entering`, so every step takes constant time.
 * @internal
 */
const wmaStepper = (period: number): Stepper<WmaState, SlidingInput, null | number> => {
	const divisor = (period * (period + 1)) / 2;
	return {
		initial: { count: 0, sum: emptySum, weighted: emptySum },
		step: (state, [entering, leaving]) => {
			const count = Math.min(state.count + 1, period);
			const weighted =
				leaving === null
					? add(state.weighted, entering * count)
					: add(add(state.weighted, -total(state.sum)), entering * period);
			const withEntering = add(state.sum, entering);
			const sum = leaving === null ? withEntering : add(withEntering, -leaving);
			return [{ count, sum, weighted }, count === period ? total(weighted) / divisor : null];
		},
	};
};

/**
 * The Weighted Moving Average (WMA) takes newer values weighted into account
 * and reacts closer to the prices compared to the Simple Moving Average (SMA).
 * It can be used to identify support and resistance levels.
 * Also prices above the WMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `period` values. Returns one value per input value; the first `period - 1` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { wma } from '@ldrick/trade-indicators';
 *
 * // weights 1, 2, 3: (3 * 1 + 3 * 2 + 6 * 3) / 6 = 4.5
 * assert.deepStrictEqual(wma([3, 3, 6, 6], 3), { ok: true, value: [null, null, 4.5, 5.5] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const wma = (values: readonly number[], period = 20): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.map(({ periodV, valuesF }) => run(wmaStepper(periodV))(slidingInputs(valuesF, periodV))),
		fromResult,
	);

/**
 * Incremental Weighted Moving Average (WMA), see `wma`. `value` is `null` as long as `wma` returns `null` for that position.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { incrementalWma } from '@ldrick/trade-indicators';
 *
 * const created = incrementalWma(3);
 * assert.ok(created.ok);
 *
 * let indicator = created.value;
 * const outputs: (null | number)[] = [];
 * for (const input of [3, 3, 6, 6]) {
 * 	const pushed = indicator.push(input);
 * 	assert.ok(pushed.ok);
 * 	indicator = pushed.value;
 * 	outputs.push(indicator.value);
 * }
 * assert.deepStrictEqual(outputs, [null, null, 4.5, 5.5]);
 * ```
 * @category incremental
 * @since 0.9.0
 * @public
 */
export const incrementalWma = (period = 20): Result<Incremental<number, null | number>> =>
	pipe(
		number_.validatePositiveInteger(period),
		R.map((periodV) =>
			toIncremental(withWindow(periodV, wmaStepper(periodV)), null, number_.validateFinite),
		),
		fromResult,
	);
