import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';

import { emaC } from './ema.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';

const calculate = (
	one: RNEA.ReadonlyNonEmptyArray<Big>,
	two: RNEA.ReadonlyNonEmptyArray<Big>,
	period: number,
): RNEA.ReadonlyNonEmptyArray<number> =>
	F.pipe(
		two,
		RNEA.mapWithIndex((index, value) => one[index + period - 1].mul(2).sub(value).toNumber()),
	);

/**
 * The Double Exponential Moving Average (DEMA) uses two Exponential Moving Average (EMA)
 * to reduce noise. It can be used to identify support and resistance levels.
 * Also prices above the DEMA can indicate uptrends, prices below can indicate downtrends.
 * @public
 */
export const dema = (
	values: readonly number[],
	period = 20,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(2 * period - 1)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => array.toBig(valuesV)),
		E.bind('emaOne', ({ valuesB, periodV }) => emaC(valuesB, periodV)),
		E.bind('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
		E.map(({ emaOne, emaTwo, periodV }) => calculate(emaOne, emaTwo, periodV)),
	);
