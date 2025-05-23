import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts';

import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import { dma } from './dma.js';

const factor = (period: number): E.Either<Error, Big> =>
	F.pipe(
		period,
		number_.toBig,
		E.map((periodB) => new Big(2).div(periodB.add(1))),
	);

/**
 * EMA without checks and conversion.
 * @internal
 */
export const emaC = (
	values: RNEA.ReadonlyNonEmptyArray<Big>,
	period: number,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
	F.pipe(
		period,
		factor,
		E.map((factorB) => dma(values, period, factorB)),
	);

/**
 * The Exponential Moving Average (EMA) takes newer values weighted into account
 * and reacts closer to the prices compared to the Simple Moving Average (SMA).
 * It can be used to identify support and resistance levels.
 * Also prices above the EMA can indicate uptrends, prices below can indicate downtrends.
 * @public
 */
export const ema = (
	values: readonly number[],
	period = 20,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: number_.validatePositiveInteger(period),
			valuesV: array.validateRequiredSize(period)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => array.toBig(valuesV)),
		E.chain(({ periodV, valuesB }) => emaC(valuesB, periodV)),
		E.map(array.toNumber),
	);
