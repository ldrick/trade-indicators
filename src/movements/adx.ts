import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as O from 'effect/Option';
import * as R from 'effect/Result';

import { smmaC } from '../averages/smma.js';
import { UnequalArraySizesError } from '../errors/UnequalArraySizesError.js';
import {
	type HighLowClose,
	type NonEmptyArray,
	type NonEmptyHighLowClose,
	type Result,
} from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import * as rec from '../utils/record.js';
import { fromResult } from '../utils/result.js';
import { atrC } from './atr.js';

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

type Movement = 'down' | 'up';

const compareMovement = (base: number, comparison: number): number =>
	base > comparison && base > 0 ? base : 0;

const movement = (up: number, down: number, move: Movement): number =>
	move === 'up' ? compareMovement(up, down) : compareMovement(down, up);

const directionalMovement = (
	values: NonEmptyHighLowClose<number>,
	move: Movement,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		values.low,
		array.tail,
		R.flatMap(
			array.traverseWithIndex((index, low) =>
				pipe(
					O.bindTo(Arr.get(values.high, index + 1), 'currentHigh'),
					O.bind('previousHigh', () => Arr.get(values.high, index)),
					O.bind('previousLow', () => Arr.get(values.low, index)),
					O.map(({ currentHigh, previousHigh, previousLow }) => {
						const up = currentHigh - previousHigh;
						const down = previousLow - low;
						return movement(up, down, move);
					}),
					// v8 ignore next -- all series are validated to have equal length, so every lookup succeeds
					R.fromOption(() => new UnequalArraySizesError()),
				),
			),
		),
	);

const directionalIndex = (
	values: NonEmptyHighLowClose<number>,
	period: number,
	move: Movement,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		R.bindTo(directionalMovement(values, move), 'dm'),
		R.let('dividends', ({ dm }) => smmaC(dm, period)),
		R.bind('divisors', () => atrC(values, period)),
		R.flatMap(({ dividends, divisors }) =>
			pipe(
				dividends,
				array.traverseWithIndex((index, dividend) =>
					pipe(
						Arr.get(divisors, index),
						// v8 ignore next -- reaching this requires directionalMovement to have already succeeded, which guarantees divisors is at least as long as dividends
						R.fromOption(() => new UnequalArraySizesError()),
						R.map((divisor) => (divisor === 0 ? 0 : (dividend * 100) / divisor)),
					),
				),
			),
		),
	);

const calculation = (
	pdi: Arr.NonEmptyReadonlyArray<number>,
	mdi: Arr.NonEmptyReadonlyArray<number>,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		pdi,
		array.traverseWithIndex((index, plus) =>
			pipe(
				Arr.get(mdi, index),
				// v8 ignore next -- pdi and mdi come from the same directionalIndex call shape, so their lengths always match
				R.fromOption(() => new UnequalArraySizesError()),
				R.map((minus) => {
					const sum = plus + minus;
					return sum === 0 ? 0 : Math.abs(plus - minus) / sum;
				}),
			),
		),
	);

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
 * import { adx } from '@ldrick/trade-indicators/movements/adx.js';
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
		R.bind('pdi', ({ periodV, valuesF }) => directionalIndex(valuesF, periodV, 'up')),
		R.bind('mdi', ({ periodV, valuesF }) => directionalIndex(valuesF, periodV, 'down')),
		R.bind('smoothed', ({ mdi, pdi, periodV }) =>
			pipe(
				calculation(pdi, mdi),
				R.map((calculated) => smmaC(calculated, periodV)),
			),
		),
		R.map(({ mdi, pdi, smoothed, valuesF }) => ({
			adx: pipe(
				smoothed,
				Arr.map((value) => value * 100),
				array.alignTo(valuesF.close.length),
			),
			mdi: array.alignTo(valuesF.close.length)(mdi),
			pdi: array.alignTo(valuesF.close.length)(pdi),
		})),
		fromResult,
	);
