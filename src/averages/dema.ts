import {
	apply as AP,
	either as E,
	function as F,
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
	period: number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		two,
		E.traverseReadonlyNonEmptyArrayWithIndex((index, value) =>
			F.pipe(
				RA.lookup(index + period - 1)(one),
				// v8 ignore next -- `one` and `two` are both derived from the same EMA chain, so their lengths are always in sync
				E.fromOption(() => new UnequalArraySizesError()),
				E.map((oneValue) => 2 * oneValue - value),
			),
		),
	);

/**
 * The Double Exponential Moving Average (DEMA) uses two Exponential Moving Average (EMA)
 * to reduce noise. It can be used to identify support and resistance levels.
 * Also prices above the DEMA can indicate uptrends, prices below can indicate downtrends.
 * @public
 */
export const dema = (values: readonly number[], period = 20): Result<NonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(2 * period - 1)(values),
		}),
		E.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		E.let('emaOne', ({ periodV, valuesF }) => emaC(valuesF, periodV)),
		E.let('emaTwo', ({ emaOne, periodV }) => emaC(emaOne, periodV)),
		E.chain(({ emaOne, emaTwo, periodV }) => calculate(emaOne, emaTwo, periodV)),
		fromEither,
	);
