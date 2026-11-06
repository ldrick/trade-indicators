import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts';

import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';

const calculation = (
	values: RNEA.ReadonlyNonEmptyArray<number>,
	period: number,
	callback: (v: RNEA.ReadonlyNonEmptyArray<number>) => number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		RNEA.range(0, values.length - period),
		E.traverseReadonlyNonEmptyArrayWithIndex((_index, r) =>
			F.pipe(
				values.slice(r, period + r),
				array.validateRequiredSize(period),
				E.map(callback),
			),
		),
	);

/**
 * Moving Average
 * @internal
 */
export const ma = (
	values: readonly number[],
	period: number,
	callback: (v: RNEA.ReadonlyNonEmptyArray<number>) => number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		E.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		E.chain(({ periodV, valuesF }) => calculation(valuesF, periodV, callback)),
	);
