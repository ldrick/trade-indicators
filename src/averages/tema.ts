import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import * as arr from '../utils/array.js';
import * as num from '../utils/number.js';
import { emaC } from './ema.js';

const calculate = (
	one: RNEA.ReadonlyNonEmptyArray<Big>,
	two: RNEA.ReadonlyNonEmptyArray<Big>,
	three: RNEA.ReadonlyNonEmptyArray<Big>,
	period: number,
): RNEA.ReadonlyNonEmptyArray<number> =>
	F.pipe(
		three,
		RNEA.mapWithIndex((index, value) =>
			one[index + 2 * (period - 1)]
				.mul(3)
				.sub(two[index + period - 1].mul(3))
				.add(value)
				.toNumber(),
		),
	);

/**
 * The Triple Exponential Moving Average (TEMA) uses three Exponential Moving Average (EMA)
 * to reduce noise and still get close to latest prices.
 * It can be used to identify support and resistance levels.
 * Also prices above the TEMA can indicate uptrends, prices below can indicate downtrends.
 * @public
 */
export const tema = (
	values: readonly number[],
	period = 20,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: num.validatePositiveInteger(period),
			valuesV: arr.validateRequiredSize(3 * period - 2)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => arr.toBig(valuesV)),
		E.bind('emaOne', ({ valuesB, periodV }) => emaC(valuesB, periodV)),
		E.bind('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
		E.bind('emaThree', ({ emaTwo, periodV }) => emaC(emaTwo, periodV)),
		E.map(({ emaOne, emaTwo, emaThree, periodV }) => calculate(emaOne, emaTwo, emaThree, periodV)),
	);
