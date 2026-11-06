import {
	apply as AP,
	either as E,
	function as F,
	option as O,
	readonlyArray as RA,
	readonlyNonEmptyArray as RNEA,
} from 'fp-ts';

import { UnequalArraySizesError } from '../errors/UnequalArraySizesError.js';
import { type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromEither } from '../utils/result.js';
import { emaC } from './ema.js';

const calculate = (
	one: RNEA.ReadonlyNonEmptyArray<number>,
	two: RNEA.ReadonlyNonEmptyArray<number>,
	three: RNEA.ReadonlyNonEmptyArray<number>,
	period: number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		three,
		E.traverseReadonlyNonEmptyArrayWithIndex((index, value) =>
			F.pipe(
				O.bindTo('oneValue')(RA.lookup(index + 2 * (period - 1))(one)),
				O.bind('twoValue', () => RA.lookup(index + period - 1)(two)),
				O.map(({ oneValue, twoValue }) => 3 * oneValue - 3 * twoValue + value),
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
export const tema = (values: readonly number[], period = 20): Result<NonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(3 * period - 2)(values),
		}),
		E.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		E.let('emaOne', ({ periodV, valuesF }) => emaC(valuesF, periodV)),
		E.let('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
		E.let('emaThree', ({ emaTwo, periodV }) => emaC(emaTwo, periodV)),
		E.chain(({ emaOne, emaThree, emaTwo, periodV }) =>
			calculate(emaOne, emaTwo, emaThree, periodV),
		),
		fromEither,
	);
