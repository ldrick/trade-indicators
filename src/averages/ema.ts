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
 * EMA as stepper.
 * @internal
 */
export const emaStepper = (period: number): Stepper<SmootherState, number, null | number> =>
	smoother(period, 2 / (period + 1));

/**
 * The Exponential Moving Average (EMA) takes newer values weighted into account
 * and reacts closer to the prices compared to the Simple Moving Average (SMA).
 * It can be used to identify support and resistance levels.
 * Also prices above the EMA can indicate uptrends, prices below can indicate downtrends.
 *
 * Requires at least `period` values. Returns one value per input value; the first `period - 1` are `null`.
 * The first calculated value is the SMA of the first `period` values.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { ema } from '@ldrick/trade-indicators';
 *
 * assert.deepStrictEqual(ema([1, 2, 3, 5, 9], 3), { ok: true, value: [null, null, 2, 3.5, 6.25] });
 * ```
 * @category indicators
 * @since 0.1.1
 * @public
 */
export const ema = (values: readonly number[], period = 20): Result<NonEmptyArray<null | number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.map(({ periodV, valuesF }) => run(emaStepper(periodV))(valuesF)),
		fromResult,
	);

/**
 * Incremental Exponential Moving Average (EMA), see `ema`. `value` is `null` as long as `ema` returns `null` for that position.
 * @example
 * ```ts
 * import assert from 'node:assert';
 * import { incrementalEma } from '@ldrick/trade-indicators';
 *
 * const created = incrementalEma(3);
 * assert.ok(created.ok);
 *
 * let indicator = created.value;
 * const outputs: (null | number)[] = [];
 * for (const input of [1, 2, 3, 5, 9]) {
 * 	const pushed = indicator.push(input);
 * 	assert.ok(pushed.ok);
 * 	indicator = pushed.value;
 * 	outputs.push(indicator.value);
 * }
 * assert.deepStrictEqual(outputs, [null, null, 2, 3.5, 6.25]);
 * ```
 * @category incremental
 * @since 0.9.0
 * @public
 */
export const incrementalEma = (period = 20): Result<Incremental<number, null | number>> =>
	pipe(
		number_.validatePositiveInteger(period),
		R.map((periodV) => toIncremental(emaStepper(periodV), null, number_.validateFinite)),
		fromResult,
	);
