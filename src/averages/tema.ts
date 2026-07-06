import { Big } from 'big.js';
import {
	apply as AP,
	either as E,
	function as F,
	option as O,
	readonlyArray as RA,
	readonlyNonEmptyArray as RNEA,
} from 'fp-ts';

import { UnequalArraySizesError } from '../errors/UnequalArraySizesError.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { emaC } from './ema.js';

const calculate = (
	one: RNEA.ReadonlyNonEmptyArray<Big>,
	two: RNEA.ReadonlyNonEmptyArray<Big>,
	three: RNEA.ReadonlyNonEmptyArray<Big>,
	period: number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		three,
		RNEA.traverseWithIndex(E.Applicative)((index, value) =>
			F.pipe(
				O.bindTo('oneValue')(RA.lookup(index + 2 * (period - 1))(one)),
				O.bind('twoValue', () => RA.lookup(index + period - 1)(two)),
				O.map(({ oneValue, twoValue }) =>
					oneValue.mul(3).sub(twoValue.mul(3)).add(value).toNumber(),
				),
				// v8 ignore next -- `one`, `two` and `three` are all derived from the same EMA chain, so their lengths are always in sync
				E.fromOption(() => new UnequalArraySizesError()),
			),
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
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(3 * period - 2)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => array.toBig(valuesV)),
		E.bind('emaOne', ({ periodV, valuesB }) => emaC(valuesB, periodV)),
		E.bind('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
		E.bind('emaThree', ({ emaTwo, periodV }) => emaC(emaTwo, periodV)),
		E.chain(({ emaOne, emaThree, emaTwo, periodV }) =>
			calculate(emaOne, emaTwo, emaThree, periodV),
		),
	);
