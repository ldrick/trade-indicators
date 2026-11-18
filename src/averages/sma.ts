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

interface SmaState {
	readonly count: number;
	readonly sum: CompensatedSum;
}

/**
 * SMA over a sliding window with a compensated running sum.
 * @internal
 */
const smaStepper = (period: number): Stepper<SmaState, SlidingInput, null | number> => ({
	initial: { count: 0, sum: emptySum },
	step: (state, [entering, leaving]) => {
		const withEntering = add(state.sum, entering);
		const sum = leaving === null ? withEntering : add(withEntering, -leaving);
		const count = Math.min(state.count + 1, period);
		return [{ count, sum }, count === period ? total(sum) / period : null];
	},
});

/**
 * The Simple Moving Average (SMA) calculates the arithmetic mean of prices over a period.
 * It can be used to identify support and resistance levels.
 * Also prices above the SMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `period` values. Returns one value per input value; the first `period - 1` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { sma } from '@ldrick/trade-indicators';
 *
 * assert.deepStrictEqual(sma([1, 2, 3, 4, 5], 3), { ok: true, value: [null, null, 2, 3, 4] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const sma = (values: readonly number[], period = 20): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.map(({ periodV, valuesF }) => run(smaStepper(periodV))(slidingInputs(valuesF, periodV))),
		fromResult,
	);

/**
 * Incremental Simple Moving Average (SMA), see `sma`. `value` is `null` as long as `sma` returns `null` for that position.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { incrementalSma } from '@ldrick/trade-indicators';
 *
 * const created = incrementalSma(3);
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
 * assert.deepStrictEqual(outputs, [null, null, 2, 3, 4]);
 * ```
 * @category incremental
 * @since 0.9.0
 * @public
 */
export const incrementalSma = (period = 20): Result<Incremental<number, null | number>> =>
	pipe(
		number_.validatePositiveInteger(period),
		R.map((periodV) =>
			toIncremental(withWindow(periodV, smaStepper(periodV)), null, number_.validateFinite),
		),
		fromResult,
	);
