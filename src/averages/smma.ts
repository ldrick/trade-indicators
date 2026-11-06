import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts';

import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { dma } from './dma.js';

/**
 * SMMA without checks.
 * @internal
 */
export const smmaC = (
	values: RNEA.ReadonlyNonEmptyArray<number>,
	period: number,
): RNEA.ReadonlyNonEmptyArray<number> => dma(values, period, 1 / period);

/**
 * The Smoothed Moving Average (SMMA) is like the Exponential Moving Average (EMA),
 * with just a “smoother” factor. It can be used to identify support and resistance levels.
 * Also prices above the SMMA can indicate uptrends, prices below can indicate downtrends.
 * @public
 */
export const smma = (
	values: readonly number[],
	period = 20,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		E.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		E.map(({ periodV, valuesF }) => smmaC(valuesF, periodV)),
	);
