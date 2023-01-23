import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import * as arr from '../utils/array.js';
import * as num from '../utils/number.js';
import { emaC } from './ema.js';

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
 *
 * @public
 */
export const dema = (
	values: ReadonlyArray<number>,
	period = 20,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: num.validatePositiveInteger(period),
			valuesV: arr.validateRequiredSize(2 * period - 1)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => arr.toBig(valuesV)),
		E.bind('emaOne', ({ valuesB, periodV }) => emaC(valuesB, periodV)),
		E.bind('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
		E.map(({ emaOne, emaTwo, periodV }) => calculate(emaOne, emaTwo, periodV)),
	);
