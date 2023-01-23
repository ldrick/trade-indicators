import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts/lib';
import { smmaC } from '../averages/smma.js';
import { HighLowClose, NonEmptyHighLowClose, ReadonlyRecordNonEmptyArray } from '../types.js';
import * as arr from '../utils/array.js';
import * as num from '../utils/number.js';
import * as rec from '../utils/record.js';
import { atrC } from './atr.js';

type Movement = 'up' | 'down';

type ADXReturn = ReadonlyRecordNonEmptyArray<number | null> & {
	readonly adx: RNEA.ReadonlyNonEmptyArray<number | null>;
	readonly mdi: RNEA.ReadonlyNonEmptyArray<number>;
	readonly pdi: RNEA.ReadonlyNonEmptyArray<number>;
};

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
		arr.tail,
		E.map(
			RNEA.mapWithIndex((index, low) => {
				const previous = index;
				const current = index + 1;
				const up = values.high[current].sub(values.high[previous]);
				const down = values.low[previous].sub(low);
				return movement(up, down, move);
			}),
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
		E.map(({ dividends, divisors }) =>
			F.pipe(
				dividends,
				RNEA.mapWithIndex((index, dividend) => {
					const divisor = divisors[index];
					return divisor.eq(0) ? new Big(0) : dividend.mul(100).div(divisor);
				}),
			),
		),
	);

const calculation = (
	pdi: RNEA.ReadonlyNonEmptyArray<Big>,
	mdi: RNEA.ReadonlyNonEmptyArray<Big>,
): RNEA.ReadonlyNonEmptyArray<Big> =>
	F.pipe(
		pdi,
		RNEA.mapWithIndex((index, plus) => {
			const sum = plus.add(mdi[index]);
			const dividend = plus.sub(mdi[index]).abs();
			return sum.eq(0) ? new Big(0) : dividend.div(sum);
		}),
	);

/**
 * The Average Directional Index (ADX) determines trend strength.
 * It also delivers Plus Directional Movement Indicator (PDI)
 * and Minus Directional Movement Indicator (MDI).
 * Crossings of these three values can be used to determine trend changes.
 *
 * @public
 */
export const adx = (values: HighLowClose<number>, period = 14): E.Either<Error, ADXReturn> =>
	F.pipe(
		AP.sequenceS(E.Applicative)({
			periodV: num.validatePositiveInteger(period),
			valuesV: rec.validateRequiredSize(2 * period)(values),
		}),
		E.bind('valuesB', ({ valuesV }) => rec.toBig(valuesV)),
		E.bind('pdi', ({ valuesB, periodV }) => directionalIndex(valuesB, periodV, 'up')),
		E.bind('mdi', ({ valuesB, periodV }) => directionalIndex(valuesB, periodV, 'down')),
		E.bind('smoothed', ({ pdi, mdi, periodV }) => {
			const calculated = calculation(pdi, mdi);
			return smmaC(calculated, periodV);
		}),
		E.map(({ smoothed, pdi, mdi }) => ({
			adx: F.pipe(
				smoothed,
				RNEA.map((value) => value.mul(100)),
				arr.toNumber,
				arr.fillLeftW(mdi.length, null),
			),
			mdi: arr.toNumber(mdi),
			pdi: arr.toNumber(pdi),
		})),
	);
