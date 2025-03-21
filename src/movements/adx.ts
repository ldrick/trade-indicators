import { Big } from 'big.js';
import { apply as AP, either as E, function as F, readonlyNonEmptyArray as RNEA } from 'fp-ts';

import { smmaC } from '../averages/smma.js';
import { HighLowClose, NonEmptyHighLowClose } from '../types.js';
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
		E.bind('smoothed', ({ mdi, pdi, periodV }) => {
			const calculated = calculation(pdi, mdi);
			return smmaC(calculated, periodV);
		}),
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
