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
 * The Average True Range (ATR) a period of the True Range Indicator,
 * being the greatest out of current high minus the current low,
 * the absolute value of current high minus previous close
 * and the absolute value of the current low minus the previous close.
 * @public
 */
export const atr = (values: HighLowClose<number>, period = 14): Result<NonEmptyArray<number>> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			sizesV: rec.validateEqualSizes(values),
			valuesV: rec.validateRequiredSize(period + 1)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => rec.validateFinite(valuesV)),
		R.flatMap(({ periodV, valuesF }) => atrC(valuesF, periodV)),
		fromResult,
	);
