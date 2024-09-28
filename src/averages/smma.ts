import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';

import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { dma } from './dma.js';

const getFactor = (period: number): E.Either<Error, Big> =>
	F.pipe(
		period,
		number_.toBig,
		E.map((periodB) => new Big(1).div(periodB)),
	);

/**
 * SMMA without checks and conversion.
 * @internal
 */
export const smmaC = (
	values: RNEA.ReadonlyNonEmptyArray<Big>,
	period: number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
	F.pipe(
		period,
		getFactor,
		E.map((factorB) => dma(values, period, factorB)),
	);

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
		E.bind('valuesB', ({ valuesV }) => array.toBig(valuesV)),
		E.chain(({ periodV, valuesB }) => smmaC(valuesB, periodV)),
		E.map(array.toNumber),
	);
