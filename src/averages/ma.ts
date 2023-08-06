import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import * as arr from '../utils/array.js';
import * as num from '../utils/number.js';

const calculation = (
	values: RNEA.ReadonlyNonEmptyArray<Big>,
	period: number,
	cb: (v: RNEA.ReadonlyNonEmptyArray<Big>) => Big,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
	F.pipe(
		RNEA.range(0, values.length - period),
		RNEA.traverse(E.Applicative)((r) =>
			F.pipe(values.slice(r, period + r), arr.validateRequiredSize(period), E.map(cb)),
		),
	);

/**
 * Moving Average
 * @internal
 */
export const ma = (
	values: readonly number[],
	period: number,
	cb: (v: RNEA.ReadonlyNonEmptyArray<Big>) => Big,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: num.validatePositiveInteger(period),
			valuesV: arr.validateRequiredSize(period)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => arr.toBig(valuesV)),
		E.chain(({ valuesB, periodV }) => calculation(valuesB, periodV, cb)),
		E.map(arr.toNumber),
	);
