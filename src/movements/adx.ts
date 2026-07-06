import { Big } from 'big.js';
import {
	apply as AP,
	either as E,
	function as F,
	option as O,
	readonlyArray as RA,
	readonlyNonEmptyArray as RNEA,
} from 'fp-ts';

import { smmaC } from '../averages/smma.js';
import { UnequalArraySizesError } from '../errors/UnequalArraySizesError.js';
import { type HighLowClose, type NonEmptyHighLowClose } from '../types.js';
import * as array from '../utils/array.js';
import * as number_ from '../utils/number.js';
import * as rec from '../utils/record.js';
import { atrC } from './atr.js';

interface ADXReturn {
	adx: RNEA.ReadonlyNonEmptyArray<null | number>;
	mdi: RNEA.ReadonlyNonEmptyArray<number>;
	pdi: RNEA.ReadonlyNonEmptyArray<number>;
}

type Movement = 'down' | 'up';

const compareMovement = (base: Big, comparision: Big): Big =>
	base.gt(comparision) && base.gt(0) ? base : new Big(0);

const movement = (up: Big, down: Big, move: Movement): Big =>
	move === 'up' ? compareMovement(up, down) : compareMovement(down, up);

const directionalMovement = (
	values: NonEmptyHighLowClose<Big>,
	move: Movement,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
	F.pipe(
		values.low,
		array.tail,
		E.chain(
			RNEA.traverseWithIndex(E.Applicative)((index, low) =>
				F.pipe(
					O.bindTo('currentHigh')(RA.lookup(index + 1)(values.high)),
					O.bind('previousHigh', () => RA.lookup(index)(values.high)),
					O.bind('previousLow', () => RA.lookup(index)(values.low)),
					O.map(({ currentHigh, previousHigh, previousLow }) => {
						const up = currentHigh.sub(previousHigh);
						const down = previousLow.sub(low);
						return movement(up, down, move);
					}),
					E.fromOption(() => new UnequalArraySizesError()),
				),
			),
		),
	);

const directionalIndex = (
	values: NonEmptyHighLowClose<Big>,
	period: number,
	move: Movement,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
	F.pipe(
		E.bindTo('dm')(directionalMovement(values, move)),
		E.bind('dividends', ({ dm }) => smmaC(dm, period)),
		E.bind('divisors', () => atrC(values, period)),
		E.chain(({ dividends, divisors }) =>
			F.pipe(
				dividends,
				RNEA.traverseWithIndex(E.Applicative)((index, dividend) =>
					F.pipe(
						RA.lookup(index)(divisors),
						// v8 ignore next -- reaching this requires directionalMovement to have already succeeded, which guarantees divisors is at least as long as dividends
						E.fromOption(() => new UnequalArraySizesError()),
						E.map((divisor) =>
							divisor.eq(0) ? new Big(0) : dividend.mul(100).div(divisor),
						),
					),
				),
			),
		),
	);

const calculation = (
	pdi: RNEA.ReadonlyNonEmptyArray<Big>,
	mdi: RNEA.ReadonlyNonEmptyArray<Big>,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<Big>> =>
	F.pipe(
		pdi,
		RNEA.traverseWithIndex(E.Applicative)((index, plus) =>
			F.pipe(
				RA.lookup(index)(mdi),
				// v8 ignore next -- pdi and mdi come from the same directionalIndex call shape, so their lengths always match
				E.fromOption(() => new UnequalArraySizesError()),
				E.map((minus) => {
					const sum = plus.add(minus);
					const dividend = plus.sub(minus).abs();
					return sum.eq(0) ? new Big(0) : dividend.div(sum);
				}),
			),
		),
	);

/**
 * The Average Directional Index (ADX) determines trend strength.
 * It also delivers Plus Directional Movement Indicator (PDI)
 * and Minus Directional Movement Indicator (MDI).
 * Crossings of these three values can be used to determine trend changes.
 * @public
 */
export const adx = (values: HighLowClose<number>, period = 14): E.Either<Error, ADXReturn> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: number_.validatePositiveInteger(period),
			valuesV: rec.validateRequiredSize(2 * period)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => rec.toBig(valuesV)),
		E.bind('pdi', ({ periodV, valuesB }) => directionalIndex(valuesB, periodV, 'up')),
		E.bind('mdi', ({ periodV, valuesB }) => directionalIndex(valuesB, periodV, 'down')),
		E.bind('smoothed', ({ mdi, pdi, periodV }) =>
			F.pipe(
				calculation(pdi, mdi),
				E.chain((calculated) => smmaC(calculated, periodV)),
			),
		),
		E.map(({ mdi, pdi, smoothed }) => ({
			adx: F.pipe(
				smoothed,
				RNEA.map((value) => value.mul(100)),
				array.toNumber,
				array.fillLeftW(mdi.length, null),
			),
			mdi: array.toNumber(mdi),
			pdi: array.toNumber(pdi),
		})),
	);
