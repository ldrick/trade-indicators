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

/**
 * Result of `adx`. `adx` is left-padded with `null` to the length of `pdi` and `mdi`.
 * @public
 */
export interface ADXReturn {
	adx: RNEA.ReadonlyNonEmptyArray<null | number>;
	mdi: RNEA.ReadonlyNonEmptyArray<number>;
	pdi: RNEA.ReadonlyNonEmptyArray<number>;
}

type Movement = 'down' | 'up';

const compareMovement = (base: number, comparison: number): number =>
	base > comparison && base > 0 ? base : 0;

const movement = (up: number, down: number, move: Movement): number =>
	move === 'up' ? compareMovement(up, down) : compareMovement(down, up);

const directionalMovement = (
	values: NonEmptyHighLowClose<number>,
	move: Movement,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		values.low,
		array.tail,
		E.chain(
			E.traverseReadonlyNonEmptyArrayWithIndex((index, low) =>
				F.pipe(
					O.bindTo('currentHigh')(RA.lookup(index + 1)(values.high)),
					O.bind('previousHigh', () => RA.lookup(index)(values.high)),
					O.bind('previousLow', () => RA.lookup(index)(values.low)),
					O.map(({ currentHigh, previousHigh, previousLow }) => {
						const up = currentHigh - previousHigh;
						const down = previousLow - low;
						return movement(up, down, move);
					}),
					E.fromOption(() => new UnequalArraySizesError()),
				),
			),
		),
	);

const directionalIndex = (
	values: NonEmptyHighLowClose<number>,
	period: number,
	move: Movement,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		E.bindTo('dm')(directionalMovement(values, move)),
		E.let('dividends', ({ dm }) => smmaC(dm, period)),
		E.bind('divisors', () => atrC(values, period)),
		E.chain(({ dividends, divisors }) =>
			F.pipe(
				dividends,
				E.traverseReadonlyNonEmptyArrayWithIndex((index, dividend) =>
					F.pipe(
						RA.lookup(index)(divisors),
						// v8 ignore next -- reaching this requires directionalMovement to have already succeeded, which guarantees divisors is at least as long as dividends
						E.fromOption(() => new UnequalArraySizesError()),
						E.map((divisor) => (divisor === 0 ? 0 : (dividend * 100) / divisor)),
					),
				),
			),
		),
	);

const calculation = (
	pdi: RNEA.ReadonlyNonEmptyArray<number>,
	mdi: RNEA.ReadonlyNonEmptyArray<number>,
): E.Either<Error, RNEA.ReadonlyNonEmptyArray<number>> =>
	F.pipe(
		pdi,
		E.traverseReadonlyNonEmptyArrayWithIndex((index, plus) =>
			F.pipe(
				RA.lookup(index)(mdi),
				// v8 ignore next -- pdi and mdi come from the same directionalIndex call shape, so their lengths always match
				E.fromOption(() => new UnequalArraySizesError()),
				E.map((minus) => {
					const sum = plus + minus;
					return sum === 0 ? 0 : Math.abs(plus - minus) / sum;
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
		E.bind('valuesF', ({ valuesV }) => rec.validateFinite(valuesV)),
		E.bind('pdi', ({ periodV, valuesF }) => directionalIndex(valuesF, periodV, 'up')),
		E.bind('mdi', ({ periodV, valuesF }) => directionalIndex(valuesF, periodV, 'down')),
		E.bind('smoothed', ({ mdi, pdi, periodV }) =>
			F.pipe(
				calculation(pdi, mdi),
				E.map((calculated) => smmaC(calculated, periodV)),
			),
		),
		E.map(({ mdi, pdi, smoothed }) => ({
			adx: F.pipe(
				smoothed,
				RNEA.map((value) => value * 100),
				array.fillLeftW(mdi.length, null),
			),
			mdi,
			pdi,
		})),
	);
