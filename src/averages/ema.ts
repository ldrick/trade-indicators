import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts';

import { type NonEmptyArray, type Result } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { fromEither } from '../utils/result.js';
import { dma } from './dma.js';

/**
 * EMA without checks.
 * @internal
 */
export const emaC = (
	values: RNEA.ReadonlyNonEmptyArray<number>,
	period: number,
): RNEA.ReadonlyNonEmptyArray<number> => dma(values, period, 2 / (period + 1));

/**
 * The Exponential Moving Average (EMA) takes newer values weighted into account
 * and reacts closer to the prices compared to the Simple Moving Average (SMA).
 * It can be used to identify support and resistance levels.
 * Also prices above the EMA can indicate uptrends, prices below can indicate downtrends.
 * @public
 */
export const ema = (values: readonly number[], period = 20): Result<NonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		E.bind('valuesF', ({ valuesV }) => array.validateFinite(valuesV)),
		E.map(({ periodV, valuesF }) => emaC(valuesF, periodV)),
		fromEither,
	);
