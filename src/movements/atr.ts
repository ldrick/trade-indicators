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

const trueRange = (
	values: NonEmptyHighLowClose<number>,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		values.high,
		array.tail,
		R.flatMap(
			array.traverseWithIndex((index, high) =>
				pipe(
					O.bindTo(Arr.get(values.close, index), 'previousClose'),
					O.bind('currentLow', () => Arr.get(values.low, index + 1)),
					O.map(({ currentLow, previousClose }) =>
						Math.max(
							high - currentLow,
							Math.abs(high - previousClose),
							Math.abs(currentLow - previousClose),
						),
					),
					// v8 ignore next -- all series are validated to have equal length, so every lookup succeeds
					R.fromOption(() => new UnequalArraySizesError()),
				),
			),
		),
	);

/**
 * ATR without checks.
 * @internal
 */
export const atrC = (
	values: NonEmptyHighLowClose<number>,
	period: number,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		values,
		trueRange,
		R.map((tr) => smmaC(tr, period)),
	);

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
 * import { atr } from '@ldrick/trade-indicators/movements/atr.js';
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
		R.flatMap(({ periodV, valuesF }) => atrC(valuesF, periodV)),
		R.map(array.alignTo(values.close.length)),
		fromResult,
	);
