import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import { toIncremental } from '../steps/incremental.js';
import { smoother, type SmootherState } from '../steps/smoother.js';
import { run, type Stepper } from '../steps/stepper.js';
import { type Incremental, type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromResult } from '../utils/result.js';

/**
 * SMMA as stepper.
 * @internal
 */
export const smmaStepper = (period: number): Stepper<SmootherState, number, null | number> =>
	smoother(period, 1 / period);

/**
 * The Smoothed Moving Average (SMMA) is like the Exponential Moving Average (EMA),
 * with just a “smoother” factor. It can be used to identify support and resistance levels.
 * Also prices above the SMMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `period` values. Returns one value per input value; the first `period - 1` are `null`.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { smma } from '@ldrick/trade-indicators';
 *
 * assert.deepStrictEqual(smma([1, 2, 3, 4, 5], 2), { ok: true, value: [null, 1.5, 2.25, 3.125, 4.0625] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const smma = (
	values: readonly number[],
	period = 20,
): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.map(({ periodV, valuesF }) => run(smmaStepper(periodV))(valuesF)),
		fromResult,
	);

/**
 * Incremental Smoothed Moving Average (SMMA), see `smma`. `value` is `null` as long as `smma` returns `null` for that position.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { incrementalSmma } from '@ldrick/trade-indicators';
 *
 * const created = incrementalSmma(2);
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
 * assert.deepStrictEqual(outputs, [null, 1.5, 2.25, 3.125, 4.0625]);
 * ```
 * @category incremental
 * @since 0.9.0
 * @public
 */
export const incrementalSmma = (period = 20): Result<Incremental<number, null | number>> =>
	pipe(
		number_.validatePositiveInteger(period),
		R.map((periodV) => toIncremental(smmaStepper(periodV), null, number_.validateFinite)),
		fromResult,
	);
