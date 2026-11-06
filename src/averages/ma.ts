import * as Arr from 'effect/Array';
import { pipe } from 'effect/Function';
import * as R from 'effect/Result';

import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';

const calculation = (
	values: Arr.NonEmptyReadonlyArray<number>,
	period: number,
	callback: (v: Arr.NonEmptyReadonlyArray<number>) => number,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		Arr.range(0, values.length - period),
		array.traverseWithIndex((_index, r) =>
			pipe(values.slice(r, period + r), array.validateRequiredSize(period), R.map(callback)),
		),
	);

/**
 * Moving Average
 * @internal
 */
export const ma = (
	values: readonly number[],
	period: number,
	callback: (v: Arr.NonEmptyReadonlyArray<number>) => number,
): R.Result<Arr.NonEmptyReadonlyArray<number>, Error> =>
	pipe(
		R.all({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		R.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		R.flatMap(({ periodV, valuesF }) => calculation(valuesF, periodV, callback)),
	);
