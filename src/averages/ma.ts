import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';

import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';

const calculation = (
	values: RNEA.ReadonlyNonEmptyArray<Big>,
	period: number,
	callback: (v: RNEA.ReadonlyNonEmptyArray<Big>) => Big,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
	F.pipe(
		RNEA.range(0, values.length - period),
		RNEA.traverse(E.Applicative)((r) =>
			F.pipe(values.slice(r, period + r), array.validateRequiredSize(period), E.map(callback)),
		),
	);

/**
 * Moving Average
 * @internal
 */
export const ma = (
	values: readonly number[],
	period: number,
	callback: (v: RNEA.ReadonlyNonEmptyArray<Big>) => Big,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => array.toBig(valuesV)),
		E.chain(({ valuesB, periodV }) => calculation(valuesB, periodV, callback)),
		E.map(array.toNumber),
	);
