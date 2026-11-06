import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts';

import { smmaC } from '../averages/smma.js';
import { type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromEither } from '../utils/result.js';

const changes = (
	values: RNEA.ReadonlyNonEmptyArray<number>,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		values,
		array.tail,
		E.map((rest) => RNEA.zipWith(rest, values, (current, previous) => current - previous)),
	);

const calculate = (
	values: RNEA.ReadonlyNonEmptyArray<number>,
	period: number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		E.bindTo('deltas')(changes(values)),
		E.let('gains', ({ deltas }) =>
			smmaC(RNEA.map((delta: number) => Math.max(delta, 0))(deltas), period),
		),
		E.let('losses', ({ deltas }) =>
			smmaC(RNEA.map((delta: number) => Math.max(-delta, 0))(deltas), period),
		),
		E.map(({ gains, losses }) =>
			RNEA.zipWith(gains, losses, (gain, loss) =>
				gain + loss === 0 ? 50 : (100 * gain) / (gain + loss),
			),
		),
	);

/**
 * The Relative Strength Index (RSI) by J. Welles Wilder is a momentum oscillator
 * between 0 and 100, comparing the smoothed average gains with the smoothed average losses.
 * Values above 70 are commonly seen as overbought, below 30 as oversold.
 * A series without any change yields the neutral value 50.
 * @public
 */
export const rsi = (values: readonly number[], period = 14): Result<NonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period + 1)(values),
		}),
		E.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		E.chain(({ periodV, valuesF }) => calculate(valuesF, periodV)),
		fromEither,
	);
